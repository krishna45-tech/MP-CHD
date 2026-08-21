import pandas as pd

FEATURE_NAMES = [
    "male",
    "age",
    "education",
    "currentSmoker",
    "cigsPerDay",
    "BPMeds",
    "prevalentStroke",
    "prevalentHyp",
    "diabetes",
    "totChol",
    "sysBP",
    "diaBP",
    "BMI",
    "heartRate",
    "glucose",
]

def build_features(raw):
    missing = [key for key in FEATURE_NAMES if key not in raw]

    if missing:
        raise ValueError(
            f"Missing Framingham features: {', '.join(missing)}"
        )

    row = {}

    for feature in FEATURE_NAMES:
        value = raw[feature]

        if value is None or value == "":
            row[feature] = None
        else:
            row[feature] = float(value)

    return pd.DataFrame([row], columns=FEATURE_NAMES)
