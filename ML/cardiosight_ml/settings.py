from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# Dev-only fallback; override with a real value in production.
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-insecure-secret-change-me")

DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"

# Server-to-server only (called by the Node gateway); allow all hosts.
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "mlapp",
]

MIDDLEWARE = []

ROOT_URLCONF = "cardiosight_ml.urls"

TEMPLATES = []

WSGI_APPLICATION = "cardiosight_ml.wsgi.application"
ASGI_APPLICATION = "cardiosight_ml.asgi.application"

# Internal Django storage only (auth/admin not used).
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = False
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
