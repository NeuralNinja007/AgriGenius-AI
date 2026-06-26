from pydantic import BaseModel


class WeatherResponse(BaseModel):
    temperature: float
    humidity: int
    wind_speed: float
    rain_probability: int
    description: str
    farming_tip: str
