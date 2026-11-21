"""JanSeva AI: beginner-friendly Flask civic services demonstration."""
import json
import os
import uuid
from datetime import datetime
from pathlib import Path

from flask import Flask, abort, flash, jsonify, redirect, render_template, request, session, url_for
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

from database.db import close_db, get_db, init_db
from services.eligibility import check_eligibility
from services.intake import next_question, update_profile
from services.ocr import extract_text
from services.notifications import list_notices, list_sources, schedule_refresh

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")
UPLOAD_DIR = ROOT / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
app = Flask(__name__)
app.config.update(SECRET_KEY=os.getenv("FLASK_SECRET_KEY", "local-demo-change-this-key"),
                  MAX_CONTENT_LENGTH=8 * 1024 * 1024, UPLOAD_FOLDER=str(UPLOAD_DIR))
app.teardown_appcontext(close_db)
ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}


@app.before_request
def ensure_database():
    init_db()
    session.setdefault("owner_key", uuid.uuid4().hex)
    # Keep locally created applications from older versions visible to this first browser session.
    db = get_db()
    db.execute("UPDATE applications SET owner_key=? WHERE owner_key=''", (session["owner_key"],))
    db.commit()
    if request.method == "POST":
        supplied = request.headers.get("X-CSRFToken") or request.form.get("csrf_token")
        if not supplied or supplied != session.get("csrf_token"):
            abort(400, description="Session expired. Reload the page and try again.")


@app.context_processor
def csrf_context():
    if "csrf_token" not in session:
        session["csrf_token"] = uuid.uuid4().hex
    unread = 0
    last_seen = session.get("notifications_seen_at")
    if last_seen:
        unread = get_db().execute("SELECT COUNT(*) FROM government_notices WHERE first_seen_at > ?", (last_seen,)).fetchone()[0]
    else:
        unread = get_db().execute("SELECT COUNT(*) FROM government_notices").fetchone()[0]
    return {"csrf_token": session["csrf_token"], "unread_notices": unread}


def active_application(create=False):
    application_id = session.get("application_id")
    db = get_db()
    row = db.execute("SELECT * FROM applications WHERE id=? AND owner_key=?", (application_id, session["owner_key"])).fetchone() if application_id else None
    if row is None and create:
        profile = {}
        cursor = db.execute("INSERT INTO applications (tracking_id, service, status, profile, owner_key, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                            ("JS-" + uuid.uuid4().hex[:8].upper(), "scholarship", "in_progress", "{}", session["owner_key"], now(), now()))
        db.commit()
        session["application_id"] = cursor.lastrowid
        row = db.execute("SELECT * FROM applications WHERE id=?", (cursor.lastrowid,)).fetchone()
    return row


def now():
    return datetime.now().isoformat(timespec="seconds")


def history(app_id, status, note):
    db = get_db()
    db.execute("INSERT INTO status_history (application_id, status, note, created_at) VALUES (?, ?, ?, ?)", (app_id, status, note, now()))
    db.commit()


@app.route("/")
def home():
    schemes = get_db().execute("SELECT * FROM schemes ORDER BY id").fetchall()
    return render_template("index.html", schemes=schemes)


@app.route("/notifications")
def notifications():
    schedule_refresh(app)
    category = request.args.get("category", "all")
    notices = list_notices(category)
    sources = list_sources()
    session["notifications_seen_at"] = now()
    return render_template("notifications.html", notices=notices, sources=sources,
                           selected_category=category)


@app.post("/notifications/refresh")
def refresh_notifications():
    started = schedule_refresh(app, force=True)
    flash("Checking official press releases. This page will update when the check finishes." if started
          else "An official notice refresh is already running.", "success")
    return redirect(url_for("notifications"))


@app.route("/api/notifications")
def notifications_api():
    schedule_refresh(app)
    records = list_notices(limit=100)
    last_seen = session.get("notifications_seen_at", "")
    unread = get_db().execute("SELECT COUNT(*) FROM government_notices WHERE first_seen_at > ?", (last_seen,)).fetchone()[0]
    return jsonify(unread=unread, notices=[{"category": row["category"], "source": row["source"],
                            "title": row["title"], "url": row["url"],
                            "published_at": row["published_at"],
                            "first_seen_at": row["first_seen_at"]} for row in records], sources=list_sources())


@app.route("/assistant")
def assistant():
    application = active_application(create=True)
    profile = json.loads(application["profile"])
    return render_template("assistant.html", application=application, profile=profile, question=next_question(profile))


@app.route("/service/<slug>")
def service_info(slug):
    services = {
        "driving-licence": {"slug": "driving-licence", "title": "Driving licence", "kind": "Learner or permanent licence", "items": ["Confirm which licence stage you need", "Check the current official eligibility and age requirements", "Prepare identity, address, age and medical documents as applicable", "Use the Parivahan portal for the official process"], "url": "https://sarathi.parivahan.gov.in/"},
        "subsidies": {"slug": "subsidies", "title": "Government subsidies", "kind": "Subsidy discovery checklist", "items": ["Identify the department and subsidy category", "Check the current scheme notice and application window", "Review income, location and category rules with the department", "Keep relevant proof and bank information ready for the official portal; do not enter sensitive data in this demo"], "url": "https://www.myscheme.gov.in/"},
    }
    info = services.get(slug)
    if not info:
        return redirect(url_for("home"))
    return render_template("service_info.html", service=info)


@app.post("/service/<slug>/start")
def service_start(slug):
    service_map = {
        "driving-licence": ("driving_licence", "Driving licence"),
        "subsidies": ("subsidy", "Government subsidy"),
    }
    selected = service_map.get(slug)
    if not selected:
        return redirect(url_for("home"))
    full_name = request.form.get("full_name", "").strip()[:120]
    state = request.form.get("state", "").strip()[:100]
    category = request.form.get("category", "").strip()[:100]
    if not full_name or not state or not category:
        flash("Please complete each field to prepare your checklist.", "error")
        return redirect(url_for("service_info", slug=slug))
    service_key, service_name = selected
    profile = {"full_name": full_name, "state": state, "category": category}
    db = get_db()
    cursor = db.execute(
        "INSERT INTO applications (tracking_id, service, status, profile, owner_key, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ("JS-" + uuid.uuid4().hex[:8].upper(), service_key, "in_progress", json.dumps(profile), session["owner_key"], now(), now()),
    )
    db.commit()
    session["application_id"] = cursor.lastrowid
    history(cursor.lastrowid, "in_progress", service_name + " demonstration checklist started")
    return redirect(url_for("application_detail", application_id=cursor.lastrowid))


@app.post("/api/chat")
def chat():
    body = request.get_json(silent=True) or {}
    message = str(body.get("message", "")).strip()
    if not message or len(message) > 1000:
        return jsonify(error="Enter a short answer (up to 1,000 characters)."), 400
    app_row = active_application(create=True)
    profile = json.loads(app_row["profile"])
    update_profile(profile, message)
    db = get_db()
    db.execute("UPDATE applications SET profile=?, updated_at=? WHERE id=?", (json.dumps(profile), now(), app_row["id"]))
    db.execute("INSERT INTO messages (application_id, role, content, created_at) VALUES (?, 'user', ?, ?)", (app_row["id"], message, now()))
    question = next_question(profile)
    if question:
        reply = question
    else:
        reply = "Thanks. I have the basic details. I will compare them against the local demonstration scheme rules. These rules are sample data, not an official eligibility decision."
    db.execute("INSERT INTO messages (application_id, role, content, created_at) VALUES (?, 'assistant', ?, ?)", (app_row["id"], reply, now()))
    db.commit()
    result = check_eligibility(profile)
    return jsonify(reply=reply, profile=profile, complete=not bool(question), eligibility=result)


@app.route("/dashboard")
def dashboard():
    applications = get_db().execute("SELECT * FROM applications WHERE owner_key=? ORDER BY updated_at DESC", (session["owner_key"],)).fetchall()
    return render_template("dashboard.html", applications=applications)


@app.route("/application/<int:application_id>")
def application_detail(application_id):
    db = get_db()
    application = db.execute("SELECT * FROM applications WHERE id=? AND owner_key=?", (application_id, session["owner_key"])).fetchone()
    if not application:
        flash("Application not found.", "error")
        return redirect(url_for("dashboard"))
    profile = json.loads(application["profile"])
    docs = db.execute("SELECT * FROM documents WHERE application_id=? ORDER BY id DESC", (application_id,)).fetchall()
    events = db.execute("SELECT * FROM status_history WHERE application_id=? ORDER BY id DESC", (application_id,)).fetchall()
    eligibility = check_eligibility(profile) if application["service"] == "scholarship" else None
    return render_template("application.html", application=application, profile=profile, docs=docs,
                           events=events, eligibility=eligibility)


@app.post("/application/<int:application_id>/upload")
def upload(application_id):
    application = get_db().execute("SELECT * FROM applications WHERE id=? AND owner_key=?", (application_id, session["owner_key"])).fetchone()
    if not application:
        flash("Application not found.", "error")
        return redirect(url_for("dashboard"))
    file = request.files.get("document")
    if not file or not file.filename:
        flash("Choose a PDF, JPG or PNG file.", "error")
        return redirect(url_for("application_detail", application_id=application_id))
    safe_name = secure_filename(file.filename)
    ext = safe_name.rsplit(".", 1)[-1].lower() if "." in safe_name else ""
    if ext not in ALLOWED_EXTENSIONS:
        flash("Only PDF, JPG and PNG files are accepted.", "error")
        return redirect(url_for("application_detail", application_id=application_id))
    stored = uuid.uuid4().hex + "." + ext
    path = UPLOAD_DIR / stored
    file.save(path)
    text = extract_text(path, ext)
    db = get_db()
    db.execute("INSERT INTO documents (application_id, original_name, stored_name, extracted_text, created_at) VALUES (?, ?, ?, ?, ?)",
               (application["id"], safe_name, stored, text, now()))
    db.commit()
    flash("File saved. Review OCR output below; extracted text may be incomplete or incorrect.", "success")
    return redirect(url_for("application_detail", application_id=application_id))


@app.post("/application/<int:application_id>/draft")
def create_draft(application_id):
    db = get_db()
    app_row = db.execute("SELECT * FROM applications WHERE id=? AND owner_key=?", (application_id, session["owner_key"])).fetchone()
    if not app_row:
        return redirect(url_for("dashboard"))
    profile = json.loads(app_row["profile"])
    if app_row["service"] == "scholarship" and next_question(profile):
        flash("Complete the applicant details in the assistant before preparing a draft.", "error")
    else:
        db.execute("UPDATE applications SET status='ready_for_review', updated_at=? WHERE id=?", (now(), application_id))
        db.commit()
        history(application_id, "ready_for_review", "Draft prepared for applicant review")
        flash("Draft prepared. Review every field before approving the simulated submission.", "success")
    return redirect(url_for("application_detail", application_id=application_id))


@app.post("/application/<int:application_id>/approve")
def approve(application_id):
    if request.form.get("confirm") != "yes":
        flash("Please confirm before continuing.", "error")
        return redirect(url_for("application_detail", application_id=application_id))
    db = get_db()
    app_row = db.execute("SELECT * FROM applications WHERE id=? AND owner_key=?", (application_id, session["owner_key"])).fetchone()
    if not app_row or app_row["status"] != "ready_for_review":
        flash("Prepare and review the draft before simulated submission.", "error")
        return redirect(url_for("application_detail", application_id=application_id))
    db.execute("UPDATE applications SET status='demo_submitted', updated_at=? WHERE id=?", (now(), application_id))
    db.commit()
    history(application_id, "demo_submitted", "Applicant approved; recorded in JanSeva AI mock portal only")
    flash("Demo application recorded in the mock portal. Nothing was sent to a government service.", "success")
    return redirect(url_for("mock_portal", application_id=application_id))


@app.route("/mock-portal/<int:application_id>")
def mock_portal(application_id):
    application = get_db().execute("SELECT * FROM applications WHERE id=? AND owner_key=?", (application_id, session["owner_key"])).fetchone()
    if not application:
        flash("Application not found.", "error")
        return redirect(url_for("dashboard"))
    if application["status"] != "demo_submitted":
        return redirect(url_for("application_detail", application_id=application_id))
    profile = json.loads(application["profile"])
    service_name = {"scholarship": "Karnataka Scholarship Demo", "driving_licence": "Driving Licence Demo", "subsidy": "Government Subsidy Demo"}.get(application["service"], "JanSeva Service Demo")
    return render_template("mock_portal.html", application=application, profile=profile, service_name=service_name)


@app.post("/application/new")
def new_application():
    session.pop("application_id", None)
    row = active_application(create=True)
    history(row["id"], "in_progress", "New demonstration application started")
    return redirect(url_for("assistant"))


@app.errorhandler(413)
def too_large(_error):
    flash("File is too large. Maximum upload size is 8 MB.", "error")
    return redirect(request.referrer or url_for("assistant"))


if __name__ == "__main__":
    with app.app_context():
        init_db()
    app.run(debug=os.getenv("FLASK_DEBUG", "0") == "1")

