"""Rule-based risk scoring.

Used to generate synthetic ground-truth labels for training (and as a
reference implementation mirroring the Angular mock algorithm). The deployed
scikit-learn model learns to reproduce these scores from raw features.
"""


def clamp(value, lo, hi):
    return max(lo, min(hi, value))


def _severity_age(age):
    return "high" if age > 55 else "medium" if age > 45 else "low"


def _severity_stress(level):
    return "high" if level >= 4 else "low"


def _severity_exercise(days):
    return "high" if days < 2 else "low"


def _severity_bp(bp):
    return "high" if bp > 145 else "medium"


def _severity_cholesterol(c):
    return "high" if c > 240 else "medium"


def _severity_glucose(g):
    return "high" if g > 140 else "medium"


def _severity_bmi(b):
    return "high" if b > 30 else "medium"


def compute_risk(input_dict):
    """Returns {score, confidence, level, factors, recommendations}."""
    inp = input_dict
    factors = []
    score = 8.0

    def add_factor(factor, contribution, severity, label, detail):
        nonlocal score
        if abs(contribution) < 0.4:
            return
        score += contribution
        factors.append(
            {
                "factor": factor,
                "impact": clamp(contribution, -1, 1),
                "severity": severity,
                "label": label,
                "detail": detail,
            }
        )

    add_factor("Age", (inp["age"] - 35) / 18, _severity_age(inp["age"]), "Age", f"{inp['age']} years")
    if inp.get("smoking"):
        add_factor("Smoking", 10, "high", "Smoking", "Tobacco use raises CVD risk substantially")
    if inp.get("snoring"):
        add_factor("Snoring", 5, "medium", "Snoring", "Frequent snoring correlates with sleep apnea")
    add_factor("Stress", (inp["stressLevel"] - 3) * 2.2, _severity_stress(inp["stressLevel"]), "Stress", f"Level {inp['stressLevel']}/5")
    add_factor(
        "Exercise",
        (1 - inp["exerciseDaysPerWeek"] / 7) * 7,
        _severity_exercise(inp["exerciseDaysPerWeek"]),
        "Physical activity",
        f"{inp['exerciseDaysPerWeek']} days/week",
    )
    if inp["systolicBp"] > 130:
        add_factor("Blood pressure", (inp["systolicBp"] - 120) / 12, _severity_bp(inp["systolicBp"]), "Systolic BP", f"{inp['systolicBp']} mmHg")
    if inp["cholesterol"] > 200:
        add_factor("Cholesterol", (inp["cholesterol"] - 190) / 14, _severity_cholesterol(inp["cholesterol"]), "Total cholesterol", f"{inp['cholesterol']} mg/dL")
    if inp["glucose"] > 110:
        add_factor("Blood glucose", (inp["glucose"] - 100) / 12, _severity_glucose(inp["glucose"]), "Fasting glucose", f"{inp['glucose']} mg/dL")
    if inp["bmi"] > 25:
        add_factor("BMI", (inp["bmi"] - 23) / 3, _severity_bmi(inp["bmi"]), "Body mass index", f"{inp['bmi']:.1f}")
    if inp["sleepDurationHours"] < 6 or inp["sleepDurationHours"] > 9:
        add_factor("Sleep duration", 6 if inp["sleepDurationHours"] < 6 else 3, "medium", "Sleep duration", f"{inp['sleepDurationHours']}h/night")
    if inp["sleepQuality"] <= 2:
        add_factor("Sleep quality", 4, "medium", "Sleep quality", f"Rated {inp['sleepQuality']}/5")
    if inp.get("sleepDisorder") and inp["sleepDisorder"] != "none":
        add_factor("Sleep disorder", 9, "high", "Sleep disorder", inp["sleepDisorder"].replace("_", " "))
    if inp.get("alcohol"):
        add_factor("Alcohol", 3, "low", "Alcohol", "Regular alcohol consumption")

    score = clamp(round(score), 2, 97)
    level = "high" if score >= 60 else "medium" if score >= 35 else "low"
    confidence = clamp(round(84 + (inp["systolicBp"] % 13) - (inp["stressLevel"] * 2)), 76, 96)

    recommendations = []
    if level == "high":
        recommendations.append("Consult a cardiologist within the next two weeks for a full cardiac evaluation.")
        recommendations.append("Begin a doctor-supervised plan to manage blood pressure and lipid levels.")
    elif level == "medium":
        recommendations.append("Schedule a preventive cardiovascular check-up with your primary physician.")
    recommendations.append("Perform 150 minutes of moderate aerobic exercise every week (brisk walking, cycling, swimming).")
    recommendations.append("Follow a heart-healthy DASH-style diet rich in vegetables, whole grains, and omega-3s.")
    if inp.get("smoking"):
        recommendations.append("Quit smoking – enrol in a cessation program; risk drops sharply within 1 year.")
    if inp.get("sleepDurationHours", 8) < 6 or inp.get("sleepQuality", 3) <= 2:
        recommendations.append("Aim for 7–9 hours of quality sleep; address sleep apnea with a sleep study if snoring is frequent.")
    if inp.get("stressLevel", 1) >= 4:
        recommendations.append("Practice 10 minutes of mindfulness or deep-breathing daily to reduce stress.")
    recommendations.append("Monitor blood pressure at home twice a week and log readings before each check-up.")
    if inp["cholesterol"] > 200:
        recommendations.append("Review your lipid profile every 6 months; consider plant sterols and dietary fibre.")
    if inp["glucose"] > 110:
        recommendations.append("Keep fasting glucose below 100 mg/dL with balanced meals and regular physical activity.")

    return {
        "score": score,
        "confidence": confidence,
        "level": level,
        "factors": factors[:6],
        "recommendations": list(dict.fromkeys(recommendations))[:6],
    }
