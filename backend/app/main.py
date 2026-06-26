from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.dependencies import set_ai_client
from app.api.router import api_router
from app.core.config import settings
from app.core.logging import logger
from app.services.ai_client import AIClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not settings.openrouter_api_key:
        logger.warning(
            "OPENROUTER_API_KEY is not set. The /api/chat endpoint will return "
            "a clear error until it is configured in your .env file."
        )
        set_ai_client(None)
    else:
        set_ai_client(
            AIClient(
                api_key=settings.openrouter_api_key,
                model_name=settings.openrouter_model,
            )
        )
        logger.info("AI client initialized (model=%s).", settings.openrouter_model)
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="AgriGenius API",
        description="Backend service for the AgriGenius agricultural AI assistant.",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)
    return app


app = create_app()
