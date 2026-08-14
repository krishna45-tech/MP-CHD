"""Prediction endpoints for the ML server (called by the Node gateway)."""

import json

import numpy as np
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .model_store import load_model
from .preprocess import build_features


def _classify(score):
    return "high" if score >= 60 else "medium" if score >= 35 else "low"


def _model_based_confidence(model, X):
    """Confidence from cross-tree prediction spread (0-100)."""
    # Trees are fitted on numpy arrays internally; the top-level model keeps
    # feature names, so pass numpy here to avoid scikit-learn warnings.
    X_np = X.to_numpy()
    per_tree = np.array([float(tree.predict(X_np)[0]) for tree in model.estimators_])
    std = float(per_tree.std())
    return int(round(max(60.0, min(98.0, 96.0 - std * 4.0))))


@require_GET
def health(request):
    return JsonResponse({"success": True, "status": "up"})


@csrf_exempt
@require_POST
def predict(request):
    try:
        payload = json.loads(request.body.decode("utf-8") or b"{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"success": False, "message": "Invalid JSON body."}, status=400)

    features = payload.get("features") or {}
    try:
        X = build_features(features)
    except ValueError as exc:
        return JsonResponse({"success": False, "message": str(exc)}, status=400)

    try:
        artifact = load_model()
    except Exception as exc:  # pragma: no cover - model bootstrap failure
        return JsonResponse({"success": False, "message": f"Model unavailable: {exc}"}, status=500)

    model = artifact["model"]
    feature_names = artifact["feature_names"]
    X = X[feature_names]

    raw = float(model.predict(X)[0])
    score = int(round(max(2.0, min(97.0, raw))))
    level = _classify(score)
    probability = min(99, score + 3)
    confidence = _model_based_confidence(model, X)

    return JsonResponse(
        {
            "success": True,
            "prediction": level,
            "risk_score": score,
            "probability": probability,
            "confidence": confidence,
            "raw_score": round(raw, 2),
        }
    )
