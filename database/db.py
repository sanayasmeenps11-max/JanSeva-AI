import sqlite3
import os
from pathlib import Path
from flask import g

DB_PATH = Path(os.getenv("JANSEVA_DB_PATH", Path(__file__).resolve().parent / "janseva.db"))

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db

def close_db(_error=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()

def init_db():
    db = get_db()
    db.executescript("""
    CREATE TABLE IF NOT EXISTS schemes (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, service TEXT NOT NULL, description TEXT NOT NULL,
      source_url TEXT NOT NULL, verification_note TEXT NOT NULL, rules TEXT NOT NULL, documents TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT, tracking_id TEXT NOT NULL UNIQUE, service TEXT NOT NULL,
      status TEXT NOT NULL, profile TEXT NOT NULL, owner_key TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, application_id INTEGER NOT NULL REFERENCES applications(id),
      role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT, application_id INTEGER NOT NULL REFERENCES applications(id),
      original_name TEXT NOT NULL, stored_name TEXT NOT NULL, extracted_text TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT, application_id INTEGER NOT NULL REFERENCES applications(id),
      status TEXT NOT NULL, note TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS government_notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT, notice_key TEXT NOT NULL UNIQUE, category TEXT NOT NULL,
      source TEXT NOT NULL, title TEXT NOT NULL, url TEXT NOT NULL, published_at TEXT,
      first_seen_at TEXT NOT NULL, last_seen_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notification_sources (
      source_key TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL,
      last_checked_at TEXT, last_error TEXT, coverage_note TEXT NOT NULL
    );
    """)
    # Migrate a database created by an earlier JanSeva version before owner keys existed.
    application_columns = {row[1] for row in db.execute("PRAGMA table_info(applications)")}
    if "owner_key" not in application_columns:
        db.execute("ALTER TABLE applications ADD COLUMN owner_key TEXT NOT NULL DEFAULT ''")
    notice_columns = {row[1] for row in db.execute("PRAGMA table_info(government_notices)")}
    if "published_at" not in notice_columns:
        db.execute("ALTER TABLE government_notices ADD COLUMN published_at TEXT")
    if db.execute("SELECT COUNT(*) FROM schemes").fetchone()[0] == 0:
        db.execute("""INSERT INTO schemes(name,service,description,source_url,verification_note,rules,documents)
        VALUES(?,?,?,?,?,?,?)""", (
            "Karnataka Scholarship Demo", "Scholarship", "A sample scheme record for demonstrating deterministic checks.",
            "https://ssp.postmatric.karnataka.gov.in/", "Demo rules only  verify current criteria with the official portal.",
            '{"state":"Karnataka","max_income":250000,"education_levels":["2nd PUC","PUC","undergraduate","postgraduate"]}',
            '["Proof of enrolment","Income certificate","Previous academic marks"]'))
    db.commit()
