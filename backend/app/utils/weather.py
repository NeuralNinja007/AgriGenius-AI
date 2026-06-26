WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy showers",
    95: "Thunderstorm",
}


def farming_tip(temp: float, rain_prob: int, humidity: int) -> str:
    if rain_prob >= 60:
        return "High rain chance — delay spraying pesticides today."
    if temp >= 38:
        return "Very hot — irrigate early morning or evening."
    if humidity >= 85:
        return "High humidity — watch for fungal diseases on crops."
    if temp <= 10:
        return "Cold conditions — protect sensitive seedlings."
    return "Good conditions for field work today."
