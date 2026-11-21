"""Small structured intake flow; eligibility never depends on an LLM guess."""
import re

FIELDS = [
    ("full_name", "What is your full name? Use a demo name if you prefer."),
    ("education", "What are you studying now? For example, 2nd PUC or undergraduate."),
    ("state", "Which state are you applying from?"),
    ("income", "What is your approximate annual household income in rupees?"),
]

def next_question(profile):
    for key, question in FIELDS:
        if not profile.get(key):
            return question
    return None

def update_profile(profile, answer):
    # Store the answer against the next missing field. Basic validation avoids accepting empty values.
    for key, _question in FIELDS:
        if not profile.get(key):
            if key == "income":
                digits = re.sub(r"[^0-9]", "", answer)
                if digits:
                    profile[key] = int(digits)
            else:
                profile[key] = answer[:120].strip()
            break
    return profile
