import pandas as pd
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


# --------------------------------------------------
# 1. Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = BASE_DIR / "framingham.csv"

ARTIFACT_DIR = Path(__file__).resolve().parent / "model_artifacts"

ARTIFACT_PATH = ARTIFACT_DIR / "framingham_model.joblib"


# --------------------------------------------------
# 2. Load dataset
# --------------------------------------------------

df = pd.read_csv(DATASET_PATH)

print("Dataset shape:", df.shape)


# --------------------------------------------------
# 3. Separate features and target
# --------------------------------------------------

X = df.drop("TenYearCHD", axis=1)

y = df["TenYearCHD"]

print("Features:", X.shape)

print("Target:", y.shape)

print("\nTarget distribution:")
print(y.value_counts())


# --------------------------------------------------
# 4. Train / test split
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# --------------------------------------------------
# 5. Create ML pipeline
# --------------------------------------------------

model = Pipeline([
    (
        "imputer",
        SimpleImputer(strategy="median")
    ),

    (
        "scaler",
        StandardScaler()
    ),

    (
        "classifier",
        LogisticRegression(
            class_weight="balanced",
            max_iter=1000,
            random_state=42
        )
    )
])


# --------------------------------------------------
# 6. Train
# --------------------------------------------------

print("\nTraining model...")

model.fit(X_train, y_train)

print("Training completed.")


# --------------------------------------------------
# 7. Save model
# --------------------------------------------------

ARTIFACT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

joblib.dump(
    {
        "model": model,
        "feature_names": list(X.columns)
    },
    ARTIFACT_PATH
)


print("\nModel saved successfully!")

print("Model:", ARTIFACT_PATH)

print("Training samples:", len(X_train))

print("Testing samples:", len(X_test))





