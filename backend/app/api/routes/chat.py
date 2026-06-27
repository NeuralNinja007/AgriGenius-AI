import asyncio

from fastapi import APIRouter, HTTPException

from app.api.dependencies import get_ai_client
from app.core.logging import logger
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()

CHAT_TIMEOUT_SECONDS = 70


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    ai_client = get_ai_client()
    if not ai_client:
        raise HTTPException(
            status_code=503,
            detail=(
                "AI service is not configured. Set OPENROUTER_API_KEY in your "
                "backend/.env file and restart the server."
            ),
        )

    if not request.message.strip() and not request.image:
        raise HTTPException(status_code=422, detail="Send a message, a photo, or both.")

    try:
        reply_text = await asyncio.wait_for(
            ai_client.generate_reply(
                message=request.message,
                history=[h.model_dump() for h in request.history],
                language=request.language,
                image_data_url=request.image,
                intent=request.intent,
                location=request.location.model_dump() if request.location else None,
            ),
            timeout=CHAT_TIMEOUT_SECONDS,
        )
        return ChatResponse(reply=reply_text, model=ai_client.model_name)
    except asyncio.TimeoutError as exc:
        logger.exception("AI request timed out")
        raise HTTPException(
            status_code=504,
            detail="AI service timed out. Please try again.",
        ) from exc
    except Exception as exc:
        logger.exception("AI request failed")
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}") from exc
