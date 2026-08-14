"""Feature engineering: raw PredictionInput JSON -> model feature vector."""

import pandas as pd

# Canonical ordered feature columns (must stay identical for training & inference).
FEATURE_NAMES = [
    "age",
    "gender_male",
    "gender_female",
    "weightKg",
    "heightCm",
    "bmi",
    "smoking",
    "smokingYears",
    "alcohol",
    "alcoholLevel",
    "exerciseDaysPerWeek",
    "stressLevel",
    "systolicBp",
    "diastolicBp",
    "cholesterol",
    "glucose",
    "heartRate",
    "sleepDurationHours",
    "sleepQuality",
    "sleepDisorder",
    "snoring",
]

_ALCOHOL_LEVEL = {"none": 0.0, "light": 1.0, "moderate": 2.0, "heavy": 3.0}
_SLEEP_DISORDER = {"none": 0.0, "insomnia": 1.0, "sleep_apnea": 2.0, "narcolepsy": 3.0}

_REQUIRED = [
    "age",
    "gender",
    "weightKg",
    "heightCm",
    "bmi",
    "smoking",
    "alcohol",
    "exerciseDaysPerWeek",
    "stressLevel",
    "systolicBp",
    "diastolicBp",
    "cholesterol",
    "glucose",
    "heartRate",
    "sleepDurationHours",
    "sleepQuality",
    "sleepDisorder",
    "snoring",
]


def _flag(value):
    return 1.0 if value else 0.0


def build_row_dict(raw):
    """Validates `raw` and returns a single feature row in FEATURE_NAMES order."""
    missing = [key for key in _REQUIRED if key not in raw]
    if missing:
        raise ValueError(f"Missing required features: {', '.join(missing)}")

    gender = raw.get("gender")
    if gender not in ("male", "female"):
        raise ValueError("Invalid gender: expected 'male' or 'female'.")

    return {
        "age": float(raw["age"]),
        "gender_male": _flag(gender == "male"),
        "gender_female": _flag(gender == "female"),
        "weightKg": float(raw["weightKg"]),
        "heightCm": float(raw["heightCm"]),
        "bmi": float(raw["bmi"]),
        "smoking": _flag(raw["smoking"]),
        "smokingYears": float(raw.get("smokingYears") or 0.0),
        "alcohol": _flag(raw["alcohol"]),
        "alcoholLevel": _ALCOHOL_LEVEL.get(raw.get("alcoholLevel"), 0.0),
        "exerciseDaysPerWeek": float(raw["exerciseDaysPerWeek"]),
        "stressLevel": float(raw["stressLevel"]),
        "systolicBp": float(raw["systolicBp"]),
        "diastolicBp": float(raw["diastolicBp"]),
        "cholesterol": float(raw["cholesterol"]),
        "glucose": float(raw["glucose"]),
        "heartRate": float(raw["heartRate"]),
        "sleepDurationHours": float(raw["sleepDurationHours"]),
        "sleepQuality": float(raw["sleepQuality"]),
        "sleepDisorder": _SLEEP_DISORDER.get(raw["sleepDisorder"], 0.0),
        "snoring": _flag(raw["snoring"]),
    }


def build_features(raw):
    """Returns a single-row DataFrame with the canonical feature columns."""
    return pd.DataFrame([build_row_dict(raw)], columns=FEATURE_NAMES)
