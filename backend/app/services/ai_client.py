import httpx

from app.prompts.system_prompts import DISEASE_ONLY_PROMPTS, PROMPTS, SYSTEM_PROMPT_EN

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


def _location_context(location: dict | None) -> str:
    if not location:
        return (
            "Detected user location: unavailable.\n"
            "Default agricultural context: Saudi Arabia, GCC.\n"
            "Default currency: SAR.\n"
            "If the user explicitly mentions another location, use that location instead."
        )

    city = location.get("city") or ""
    state = location.get("stateProvince") or ""
    country = location.get("country") or ""
    country_code = location.get("countryCode") or ""
    currency = location.get("currency") or ""
    latitude = location.get("latitude")
    longitude = location.get("longitude")
    label = location.get("label") or ", ".join(part for part in [city, state, country] if part)

    lines = [
        "Detected user location context:",
        f"Location label: {label or 'Unavailable'}",
        f"Latitude: {latitude}" if latitude is not None else "Latitude: unavailable",
        f"Longitude: {longitude}" if longitude is not None else "Longitude: unavailable",
        f"City: {city or 'unavailable'}",
        f"State / Province: {state or 'unavailable'}",
        f"Country: {country or 'unavailable'}",
        f"Country code: {country_code or 'unavailable'}",
        f"Local currency: {currency or 'SAR'}",
        "Use this detected location as the default for crop, irrigation, fertilizer, pesticide, market, supplier, seasonal, pest, and soil advice.",
        "If the user explicitly mentions another country, city, or region, that explicit user location overrides this detected location for the current conversation.",
        "Do not invent live local prices, supplier names, regulations, pest alerts, or official data. If reliable exact local information is unavailable, say so and give the closest practical regional recommendation.",
    ]
    return "\n".join(lines)


class AIClient:
    def __init__(self, api_key: str, model_name: str = "openrouter/free"):
        self.api_key = api_key
        self.model_name = model_name

    async def generate_reply(
        self,
        message: str,
        history: list[dict],
        language: str = "en",
        image_data_url: str | None = None,
        intent: str = "general",
        location: dict | None = None,
    ) -> str:
        """
        Sends the user's message, prior turns, and optional photo to OpenRouter.

        history: list of {"role": "user"|"assistant", "content": str}
        language: "en", "ar", or "hi"
        image_data_url: optional base64 data URL
        intent: "general" or "disease" — disease uses structured diagnosis prompt
        """
        system_prompt = PROMPTS.get(language, SYSTEM_PROMPT_EN)
        if intent == "disease" and image_data_url:
            system_prompt = (
                PROMPTS.get(language, SYSTEM_PROMPT_EN)
                + "\n"
                + DISEASE_ONLY_PROMPTS.get(language, DISEASE_ONLY_PROMPTS["en"])
            )

        messages = [{"role": "system", "content": system_prompt + "\n\n" + _location_context(location)}]

        for turn in history:
            text = turn.get("content") or ""
            if not text:
                continue
            role = "user" if turn["role"] == "user" else "assistant"
            messages.append({"role": role, "content": text})

        message_text = message.strip()
        if not message_text and image_data_url:
            if intent == "disease":
                message_text = (
                    "Please analyze this crop photo for disease or pest damage. "
                    "Identify the disease, confidence level, symptoms, causes, "
                    "treatment, and prevention."
                )
            else:
                message_text = (
                    "Please look at this photo and tell me what you notice about "
                    "the crop, plant, soil, or pest shown — and what I should do about it."
                )

        if image_data_url:
            content = [{"type": "text", "text": message_text}]
            content.append({"type": "image_url", "image_url": {"url": image_data_url}})
            messages.append({"role": "user", "content": content})
        else:
            messages.append({"role": "user", "content": message_text})

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model_name,
                    "messages": messages,
                    "max_tokens": 2048,
                    "temperature": 0.3,
                },
            )

        if response.status_code != 200:
            raise ValueError(f"OpenRouter API error ({response.status_code}): {response.text}")

        data = response.json()
        try:
            reply_text = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as exc:
            raise ValueError(f"Unexpected OpenRouter response shape: {data}") from exc

        if not reply_text:
            raise ValueError("Empty response from OpenRouter")

        return reply_text
