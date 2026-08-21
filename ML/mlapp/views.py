import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .model_store import load_model
from .preprocess import build_features


@require_GET
def health(request):
    return JsonResponse({
        "success": True,
        "status": "up"
    })


@csrf_exempt
@require_POST
def predict(request):
    try:
        payload = json.loads(
            request.body.decode("utf-8") or "{}"
        )
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {
                "success": False,
                "message": "Invalid JSON body."
            },
            status=400
        )

    features = payload.get("features") or {}

    try:
        X = build_features(features)
    except ValueError as exc:
        return JsonResponse(
            {
                "success": False,
                "message": str(exc)
            },
            status=400
        )

    try:
        artifact = load_model()
        model = artifact["model"]

        X = X[artifact["feature_names"]]

        prediction = int(model.predict(X)[0])
        probability = float(model.predict_proba(X)[0][1])

        return JsonResponse({
            "success": True,
            "prediction": prediction,
            "probability": round(probability * 100, 2),
            "risk_score": round(probability * 100, 2),
            "message": (
                "Higher estimated 10-year CHD risk"
                if prediction == 1
                else "Lower estimated 10-year CHD risk"
            )
        })

    except Exception as exc:
        return JsonResponse(
            {
                "success": False,
                "message": f"Prediction failed: {exc}"
            },
            status=500
        )
