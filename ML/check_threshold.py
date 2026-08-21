import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

df = pd.read_csv("framingham.csv")

X = df.drop("TenYearCHD", axis=1)
y = df["TenYearCHD"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

artifact = joblib.load("mlapp/model_artifacts/model.joblib")
model = artifact["model"]

prob = model.predict_proba(X_test)[:, 1]

best = None

for threshold in [i / 100 for i in range(20, 61)]:
    pred = (prob >= threshold).astype(int)

    f1 = f1_score(y_test, pred)
    recall = recall_score(y_test, pred)
    precision = precision_score(y_test, pred)
    accuracy = accuracy_score(y_test, pred)

    if best is None or f1 > best["f1"]:
        best = {
            "threshold": threshold,
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1": f1
        }

print("\nBEST THRESHOLD:")
print(best)

print("\nROC-AUC:")
print(roc_auc_score(y_test, prob))
