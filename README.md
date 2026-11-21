# JanSeva AI

A beginner-friendly Flask and SQLite demonstration for guided civic service applications. The scholarship path supports structured intake, deterministic sample rule checks, file uploads, optional OCR, draft review, explicit confirmation, and a local application dashboard.

## Important demo limits

- The included scholarship thresholds and education list are illustrative local sample data, not verified current eligibility rules. Confirm scheme rules and dates with the linked official portal.
- Demo submitted means the citizen approved a record in this local app. It does not submit to a government website.
- Use synthetic names and sample documents. Do not upload Aadhaar, bank details, or other sensitive records.
- Driving licence and subsidy cards are informational entry points at this stage; the complete end-to-end workflow is the scholarship demo.
- Government updates checks the PIB official release listing for matching scholarship, driving licence and subsidy titles, and links to NSP, Karnataka SSP, Sarathi, MoRTH and myScheme. It is a reader for public notices, not a complete government alert service: several state and scheme portals do not expose a public RSS/API feed, so check those official pages directly.
- OCR for images is optional and requires the Python packages plus the separate Tesseract OCR program. PDF files are saved, but PDF text extraction is not configured.

## Run on Windows / VS Code

Open PowerShell in the project folder, then run:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1  # In Command Prompt, use .venv\Scripts\activate.bat
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python app.py
```

Open http://127.0.0.1:5000. SQLite initializes automatically at `database/janseva.db` and inserts the sample scheme record on first run. The app works without an API key or external AI service. For OCR, install Tesseract OCR for Windows and make sure `tesseract.exe` is available on PATH; if needed configure `pytesseract.pytesseract.tesseract_cmd` in `services/ocr.py`.

## Deploy on Render

This project includes a Docker-based Render Blueprint (`render.yaml`). It installs Tesseract for image OCR, serves Flask through Gunicorn, uses Render's `PORT`, and exposes `/healthz` for health checks. SQLite and uploads are configured to live under `/var/data` on a persistent disk. The Blueprint uses a paid web-service compute plan because Render persistent disks require a paid service. Review the current price in your Render dashboard before approving service creation. The disk is single-instance, so this SQLite setup should remain at one service instance.

1. Put the project in a GitHub repository that you own. Do not upload `.env`, database files, uploaded documents, or secrets. `.gitignore` and `.dockerignore` exclude these local files; keep the generated `FLASK_SECRET_KEY` only in Render's environment.
2. Sign in to Render and choose **New > Blueprint**. Connect the GitHub repository and select its branch. Render reads `render.yaml`; inspect the service and disk plan/cost before confirming.
3. Render generates `FLASK_SECRET_KEY` automatically. The Blueprint configures persistent SQLite and upload paths plus secure session cookies. No third-party API key is required.
4. Wait for the first build and deploy to finish. The Render dashboard will show the public `https://janseva-ai.onrender.com` address if that service name is available; otherwise use the exact URL Render assigns.
5. Open the public URL and verify the home page, language selector, assistant, service checklists, dashboard, notifications and `/healthz`. Use synthetic data only. Do not upload real identity, bank or other sensitive documents to this public hackathon demo.

Render requires a connected Git provider account and your approval of any paid service or persistent-disk charges. I cannot create the public service or approve billing without access to your Render account. Once the repository is connected and Render completes the deploy, share the assigned URL or any build error and I can help verify/fix it.

## Try the demo

1. Select **Start an application** and answer with synthetic data. Suggested flow: `Demo Student`, `2nd PUC`, `Karnataka`, `180000`.
2. Open **Application details** from the assistant, inspect each sample check and documents note.
3. Optionally upload a test image or PDF under 8 MB. Read and confirm OCR output yourself.
4. Select **Prepare draft for review**, then tick the explicit consent box and confirm the simulated submission.
5. Open **My applications** to see its tracking reference and status history.

## Project map

- `app.py`  Flask pages, JSON assistant endpoint, upload handling, review and demo approval routes.
- `database/db.py`  SQLite schema and one sample scheme record.
- `services/intake.py`  structured one-question-at-a-time applicant intake.
- `services/eligibility.py`  transparent deterministic checks against sample rules.
- `services/ocr.py`  optional image OCR with a safe fallback.
- `services/notifications.py`  cached, keyword-matched official PIB notices and direct official portal links.
- `templates/` and `static/`  responsive pages, styling and chat behavior.
- `uploads/`  local uploaded files (excluded from Git).

The current assistant uses a deterministic conversational flow and requires no API credentials. To add a language model later, keep its key in an environment variable and continue using Python rules for eligibility decisions.

