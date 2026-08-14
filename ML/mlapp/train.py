"""Synthetic data generation + scikit-learn model training.

Run explicitly with:  python -m mlapp.train
(Or let model_store.train_if_missing() bootstrap the artifact automatically.)
"""

import numpy as np
import pandas as pd
import joblib
from pathlib import Path

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, root_mean_squared_error

from .preprocess import FEATURE_NAMES, build_row_dict
from .risk_lib import compute_risk, clamp

ARTIFACT_DIR = Path(__file__).parent / "model_artifacts"
ARTIFACT_PATH = ARTIFACT_DIR / "model.joblib"

_DISORDERS = ["none", "insomnia", "sleep_apnea", "none", "none"]


def _random_input(rng):
    return {
        "age": int(rng.integers(20, 85)),
        "gender": "male" if rng.random() < 0.5 else "female",
        "weightKg": round(float(rng.uniform(45, 120)), 1),
        "heightCm": round(float(rng.uniform(150, 190)), 1),
        "bmi": round(float(rng.uniform(18, 40)), 1),
        "smoking": bool(rng.random() < 0.3),
        "smokingYears": int(rng.integers(1, 50)) if rng.random() < 0.3 else 0,
        "alcohol": bool(rng.random() < 0.35),
        "alcoholLevel": str(rng.choice(["none", "light", "moderate", "heavy"])),
        "exerciseDaysPerWeek": int(rng.integers(0, 7)),
        "stressLevel": int(rng.integers(1, 6)),
        "systolicBp": round(float(rng.uniform(100, 170)), 0),
        "diastolicBp": round(float(rng.uniform(60, 110)), 0),
        "cholesterol": round(float(rng.uniform(120, 280)), 0),
        "glucose": round(float(rng.uniform(75, 180)), 0),
        "heartRate": round(float(rng.uniform(55, 110)), 0),
        "sleepDurationHours": round(float(rng.uniform(4, 10)), 1),
        "sleepQuality": int(rng.integers(1, 6)),
        "sleepDisorder": str(rng.choice(_DISORDERS)),
        "snoring": bool(rng.random() < 0.4),
    }


def generate_dataset(n=6000, seed=42):
    """Creates a labelled synthetic dataset. Target = rule-based score + noise."""
    rng = np.random.default_rng(seed)
    rows = []
    targets = []
    for _ in range(n):
        raw = _random_input(rng)
        score = compute_risk(raw)["score"]
        score += rng.normal(0, 6)  # label noise makes it a genuine learning task
        rows.append(build_row_dict(raw))
        targets.append(clamp(score, 2, 97))
    X = pd.DataFrame(rows, columns=FEATURE_NAMES)
    return X, np.array(targets)


def train_model(n=6000, seed=42, artifact_path=None):
    """Trains a RandomForest regressor on synthetic data and saves it."""
    X, y = generate_dataset(n=n, seed=seed)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=seed)

    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=20,
        min_samples_leaf=2,
        random_state=seed,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    pred = model.predict(X_test)
    r2 = r2_score(y_test, pred)
    rmse = root_mean_squared_error(y_test, pred)

    path = Path(artifact_path) if artifact_path else ARTIFACT_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "feature_names": list(FEATURE_NAMES)}, path)

    return {
        "samples": n,
        "r2": round(float(r2), 4),
        "rmse": round(float(rmse), 3),
        "artifact": str(path),
    }


if __name__ == "__main__":
    import json

    print(json.dumps(train_model(), indent=2))
