from dataclasses import dataclass
from threading import RLock
from time import monotonic

import httpx
from fastapi import APIRouter, HTTPException

from app.core.logging import logger
from app.schemas.weather import WeatherResponse
from app.utils.weather import WEATHER_CODES, farming_tip

router = APIRouter()

CACHE_TTL_SECONDS = 600


@dataclass
class WeatherCacheEntry:
    response: WeatherResponse
    expires_at: float


_weather_cache: dict[tuple[float, float], WeatherCacheEntry] = {}
_weather_cache_lock = RLock()


def _cache_key(lat: float, lon: float) -> tuple[float, float]:
    return (round(lat, 2), round(lon, 2))


def _get_cached_weather(key: tuple[float, float], *, allow_expired: bool = False) -> WeatherResponse | None:
    now = monotonic()
    with _weather_cache_lock:
        entry = _weather_cache.get(key)
        if not entry:
            return None
        if allow_expired or entry.expires_at > now:
            return entry.response
        return None


def _set_cached_weather(key: tuple[float, float], response: WeatherResponse) -> None:
    with _weather_cache_lock:
        _weather_cache[key] = WeatherCacheEntry(
            response=response,
            expires_at=monotonic() + CACHE_TTL_SECONDS,
        )


def _parse_weather_response(data: dict) -> WeatherResponse:
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


@router.get("/weather", response_model=WeatherResponse)
async def get_weather(lat: float, lon: float):
    """Proxy Open-Meteo (free, no API key) for local farming weather."""
    key = _cache_key(lat, lon)
    cached = _get_cached_weather(key)
    if cached:
        logger.info("Weather cache hit for lat=%s lon=%s", key[0], key[1])
        return cached

    logger.info("Weather cache miss for lat=%s lon=%s", key[0], key[1])
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={key[0]:.2f}&longitude={key[1]:.2f}"
        "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
        "&daily=precipitation_probability_max"
        "&timezone=auto"
        "&forecast_days=1"
    )
    try:
        logger.info("Open-Meteo request for lat=%s lon=%s", key[0], key[1])
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url)
            if response.status_code == 429:
                logger.warning("Open-Meteo 429 for lat=%s lon=%s", key[0], key[1])
                stale_cached = _get_cached_weather(key, allow_expired=True)
                if stale_cached:
                    return stale_cached
                raise HTTPException(
                    status_code=503,
                    detail="Weather service temporarily unavailable. Please try again in a few minutes.",
                )
            response.raise_for_status()
            data = response.json()
            weather_response = _parse_weather_response(data)
            _set_cached_weather(key, weather_response)
            return weather_response
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Weather fetch failed")
        raise HTTPException(status_code=502, detail="Could not fetch weather data.") from exc
