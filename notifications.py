"""Fetch topic-matched notices from the official PIB public releases listing."""
from datetime import datetime, timedelta
import gzip
from html.parser import HTMLParser
import re
from threading import Lock, Thread
from urllib.error import URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

from database.db import get_db

PIB_URL = "https://www.pib.gov.in/AllRelease.aspx?MenuId=23&PMO=1&lang=1&reg=1"
REFRESH_INTERVAL = timedelta(minutes=30)
MAX_PAGE_BYTES = 2_000_000
_refresh_lock = Lock()

# Other public portals are linked for direct checking. They do not currently
# publish a confirmed machine-readable all-notifications feed for this app.
PORTAL_SOURCES = [
    ("nsp", "National Scholarship Portal", "https://scholarships.gov.in/", "Announcements are shown on the official portal; no public RSS/API feed was confirmed."),
    ("ssp", "Karnataka State Scholarship Portal", "https://ssp.postmatric.karnataka.gov.in/", "Check the portal directly; no public RSS/API feed was confirmed."),
    ("sarathi", "Sarathi Driving Licence Services", "https://sarathi.parivahan.gov.in/", "Service notices and state-specific details are maintained on the official portal."),
    ("morth", "Ministry of Road Transport and Highways", "https://morth.nic.in/notifications", "Official notifications page; no public RSS/API feed was confirmed."),
    ("myscheme", "myScheme Government Schemes", "https://www.myscheme.gov.in/", "Use the official scheme finder; it does not present a consolidated notification feed."),
]

TERMS = {
    "scholarship": ("scholarship", "fellowship", "student stipend", "national scholarship", "education assistance"),
    "driving_licence": ("driving licence", "driving license", "learner licence", "learner license", "sarathi", "motor vehicle rules"),
    "subsidy": ("subsidy", "subsidies", "subsidised", "subsidized"),
}


def _now():
    return datetime.now().astimezone().isoformat(timespec="seconds")


class ReleaseLinkParser(HTMLParser):
    """Collect PIB press-release links while ignoring navigation and assets."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links = []
        self._li_depth = 0
        self._href = None
        self._anchor_text = []
        self._li_text = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "li":
            self._li_depth += 1
            if self._li_depth == 1:
                self._href, self._anchor_text, self._li_text = None, [], []
        elif tag.lower() == "a" and self._li_depth:
            self._href = dict(attrs).get("href", "")
            self._anchor_text = []

    def handle_data(self, data):
        if self._li_depth:
            self._li_text.append(data)
            if self._href is not None:
                self._anchor_text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            title = " ".join(" ".join(self._anchor_text).split())
            if self._href and title:
                self._pending = (title, urljoin(PIB_URL, self._href))
            self._href = None
        elif tag.lower() == "li" and self._li_depth:
            self._li_depth -= 1
            if self._li_depth == 0:
                pending = getattr(self, "_pending", None)
                if pending:
                    text = " ".join(" ".join(self._li_text).split())
                    match = re.search(r"Posted on:\s*(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})", text, re.I)
                    published = None
                    if match:
                        try:
                            published = datetime.strptime(match.group(1), "%d %b %Y").date().isoformat()
                        except ValueError:
                            pass
                    self.links.append((pending[0], pending[1], published))
                    self._pending = None


def _category_for(title):
    lowered = title.casefold()
    matches = [category for category, terms in TERMS.items() if any(term in lowered for term in terms)]
    return matches


def refresh_notices(force=False):
    """Refresh PIB-matched notices when stale; keep cached notices on failures."""
    db = get_db()
    source = db.execute("SELECT * FROM notification_sources WHERE source_key='pib'").fetchone()
    if not force and source and source["last_checked_at"]:
        try:
            last = datetime.fromisoformat(source["last_checked_at"])
            if datetime.now(last.tzinfo) - last < REFRESH_INTERVAL:
                return {"updated": False, "error": source["last_error"]}
        except ValueError:
            pass

    try:
        request = Request(PIB_URL, headers={"User-Agent": "JanSevaAI/1.0 (official public notices reader)", "Accept-Encoding": "gzip"})
        with urlopen(request, timeout=12) as response:
            raw = response.read(MAX_PAGE_BYTES + 1)
            if response.headers.get("Content-Encoding", "").lower() == "gzip":
                raw = gzip.decompress(raw)
        if len(raw) > MAX_PAGE_BYTES:
            raise ValueError("PIB listing exceeded the 2 MB safety limit")
        parser = ReleaseLinkParser()
        parser.feed(raw.decode("utf-8", errors="replace"))
        rows = []
        seen_keys = set()
        cutoff = (datetime.now().date() - timedelta(days=180)).isoformat()
        for title, link, published_at in parser.links:
            if urlparse(link).hostname not in {"www.pib.gov.in", "pib.gov.in"}:
                continue
            if not any(path in link for path in ("PressRelease", "PressRelese", "PressNote")):
                continue
            if published_at and published_at < cutoff:
                continue
            for category in _category_for(title):
                key = category + "|" + link
                if key not in seen_keys:
                    rows.append((category, title[:500], link, published_at))
                    seen_keys.add(key)
        checked = _now()
        for category, title, link, published_at in rows:
            key = category + "|" + link
            db.execute("""INSERT INTO government_notices
                (notice_key, category, source, title, url, published_at, first_seen_at, last_seen_at)
                VALUES (?, ?, 'Press Information Bureau', ?, ?, ?, ?, ?)
                ON CONFLICT(notice_key) DO UPDATE SET title=excluded.title, published_at=excluded.published_at, last_seen_at=excluded.last_seen_at""",
                (key, category, title, link, published_at, checked, checked))
        db.execute("""INSERT INTO notification_sources
            (source_key,name,url,last_checked_at,last_error,coverage_note)
            VALUES ('pib','Press Information Bureau releases',?,?,NULL,?)
            ON CONFLICT(source_key) DO UPDATE SET last_checked_at=excluded.last_checked_at,last_error=NULL""",
            (PIB_URL, checked, "Automatic keyword matching from official central press releases; not a complete list of department or state notices."))
        db.commit()
        return {"updated": True, "error": None, "count": len(rows)}
    except Exception as error:
        checked = _now()
        message = str(error)[:300]
        db.execute("""INSERT INTO notification_sources
            (source_key,name,url,last_checked_at,last_error,coverage_note)
            VALUES ('pib','Press Information Bureau releases',?,?,?,?)
            ON CONFLICT(source_key) DO UPDATE SET last_checked_at=excluded.last_checked_at,last_error=excluded.last_error""",
            (PIB_URL, checked, message, "Automatic keyword matching from official central press releases; not a complete list of department or state notices."))
        db.commit()
        return {"updated": False, "error": message}


def schedule_refresh(flask_app, force=False):
    """Kick off a network refresh without making a page load wait on PIB."""
    if not _refresh_lock.acquire(blocking=False):
        return False

    def work():
        try:
            with flask_app.app_context():
                refresh_notices(force=force)
        finally:
            _refresh_lock.release()

    Thread(target=work, name="janseva-notice-refresh", daemon=True).start()
    return True


def list_notices(category=None, limit=100):
    db = get_db()
    if category in TERMS:
        return db.execute("SELECT * FROM government_notices WHERE category=? ORDER BY COALESCE(published_at,last_seen_at) DESC LIMIT ?", (category, limit)).fetchall()
    return db.execute("SELECT * FROM government_notices ORDER BY COALESCE(published_at,last_seen_at) DESC LIMIT ?", (limit,)).fetchall()


def list_sources():
    db = get_db()
    live = db.execute("SELECT * FROM notification_sources WHERE source_key='pib'").fetchone()
    result = [dict(live) if live else {"source_key": "pib", "name": "Press Information Bureau releases", "url": PIB_URL,
                                      "last_checked_at": None, "last_error": None,
                                      "coverage_note": "Automatic keyword matching from official central press releases; not a complete list of department or state notices."}]
    result.extend({"source_key": key, "name": name, "url": url, "last_checked_at": None, "last_error": None, "coverage_note": note}
                  for key, name, url, note in PORTAL_SOURCES)
    return result
