import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    openrouter_api_key: str = os.environ.get("OPENROUTER_API_KEY", "")
    openrouter_model: str = os.environ.get("OPENROUTER_MODEL", "openrouter/free")
    allowed_origins: list[str] = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")


settings = Settings()
