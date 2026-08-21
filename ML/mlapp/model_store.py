import joblib
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent / "model_artifacts" / "model.joblib"

_loaded = None

def load_model():
    global _loaded

    if _loaded is not None:
        return _loaded

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

    _loaded = joblib.load(MODEL_PATH)
    print(f"[mlapp] Framingham model loaded from {MODEL_PATH}")

    return _loaded
