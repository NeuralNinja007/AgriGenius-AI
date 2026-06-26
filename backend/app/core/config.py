import os

from dotenv import load_dotenv

load_dotenv()


def _csv_env(name: str, default: str = "") -> list[str]:
    return [value.strip() for value in os.environ.get(name, default).split(",") if value.strip()]


class Settings:
    openrouter_api_key: str = os.environ.get("OPENROUTER_API_KEY", "")
    openrouter_model: str = os.environ.get("OPENROUTER_MODEL", "openrouter/free")
    allowed_origins: list[str] = _csv_env(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )


settings = Settings()
