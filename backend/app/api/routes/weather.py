import httpx
from fastapi import APIRouter, HTTPException

from app.core.logging import logger
from app.schemas.weather import WeatherResponse
from app.utils.weather import WEATHER_CODES, farming_tip

router = APIRouter()


@router.get("/weather", response_model=WeatherResponse)
async def get_weather(lat: float, lon: float):
    """Proxy Open-Meteo (free, no API key) for local farming weather."""
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
        "&daily=precipitation_probability_max"
        "&timezone=auto"
        "&forecast_days=1"
    )
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
    except Exception as exc:
        logger.exception("Weather fetch failed")
        raise HTTPException(status_code=502, detail="Could not fetch weather data.") from exc

    current = data.get("current", {})
    daily = data.get("daily", {})
    code = int(current.get("weather_code", 0))
    temp = float(current.get("temperature_2m", 0))
    humidity = int(current.get("relative_humidity_2m", 0))
    wind = float(current.get("wind_speed_10m", 0))
    rain_prob = int((daily.get("precipitation_probability_max") or [0])[0])

    return WeatherResponse(
        temperature=temp,
        humidity=humidity,
        wind_speed=wind,
        rain_probability=rain_prob,
        description=WEATHER_CODES.get(code, "Unknown"),
        farming_tip=farming_tip(temp, rain_prob, humidity),
    )
