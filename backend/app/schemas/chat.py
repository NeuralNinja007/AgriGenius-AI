from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str


class ChatRequest(BaseModel):
    message: str = Field(default="", max_length=2000)
    image: str | None = Field(default=None, description="Base64 data URL of an attached photo")
    language: str = Field(default="en", description="'en', 'ar', or 'hi' — reply language")
    history: list[ChatMessage] = Field(default_factory=list)
    intent: str = Field(default="general", description="'general' or 'disease'")


class ChatResponse(BaseModel):
    reply: str
    model: str
