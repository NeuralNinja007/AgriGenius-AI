from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """Simple readiness probe — useful once this is deployed."""
    return {
        "status": "ok",
        "ai_configured": bool(settings.openrouter_api_key),
        "model": settings.openrouter_model,
    }
