from app.services.ai_client import AIClient

ai_client: AIClient | None = None


def set_ai_client(client: AIClient | None) -> None:
    global ai_client
    ai_client = client


def get_ai_client() -> AIClient | None:
    return ai_client
