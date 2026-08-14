"""Loads the trained model artifact, bootstrapping training if needed."""

import joblib

from .train import ARTIFACT_PATH, train_model

_loaded = None


def load_model():
    """Returns {'model': <regressor>, 'feature_names': [...]} (cached)."""
    global _loaded
    if _loaded is not None:
        return _loaded
    if not ARTIFACT_PATH.exists():
        print("[mlapp] Model artifact missing – training a fresh model...")
        train_model()
    _loaded = joblib.load(ARTIFACT_PATH)
    print(f"[mlapp] Model loaded from {ARTIFACT_PATH}")
    return _loaded
