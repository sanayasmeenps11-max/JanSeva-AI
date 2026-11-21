"""Transparent demo eligibility rules. This is not an official determination."""
import json
from database.db import get_db

def check_eligibility(profile):
    scheme = get_db().execute("SELECT * FROM schemes WHERE id=1").fetchone()
    if not scheme:
        return {"scheme": None, "label": "No local scheme record", "checks": [], "documents": []}
    rules = json.loads(scheme["rules"])
    checks = []
    if profile.get("state"):
        checks.append({"name": "State", "passed": profile["state"].strip().lower() == rules["state"].lower(),
                       "detail": "Demo record lists Karnataka."})
    if profile.get("education"):
        accepted = {value.lower() for value in rules["education_levels"]}
        checks.append({"name": "Education level", "passed": profile["education"].strip().lower() in accepted,
                       "detail": "Compared with the sample education levels in the local demo record."})
    if profile.get("income"):
        checks.append({"name": "Annual household income", "passed": profile["income"] <= rules["max_income"],
                       "detail": "Sample threshold: 2,50,000; this is not a verified current scheme limit."})
    return {"scheme": scheme["name"], "label": "Demonstration only  not an official eligibility decision",
            "checks": checks, "documents": json.loads(scheme["documents"]), "source_url": scheme["source_url"],
            "verification_note": scheme["verification_note"]}
