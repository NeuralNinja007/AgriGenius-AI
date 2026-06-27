import { useCallback, useEffect, useRef, useState } from 'react'
import { MapPinIcon } from '../../../components/common/Icons.jsx'
import { getWeather } from '../../../services/api/weatherApi.js'

const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000
const weatherCache = new Map()
const weatherRequests = new Map()

function weatherCacheKey(location) {
  return `${location.latitude.toFixed(2)},${location.longitude.toFixed(2)}`
}

function readCachedWeather(key) {
  const cached = weatherCache.get(key)
  if (!cached) return null
  if (Date.now() - cached.cachedAt > WEATHER_CACHE_TTL_MS) {
    weatherCache.delete(key)
    return null
  }
  return cached.weather
}

function writeCachedWeather(key, weather) {
  weatherCache.set(key, {
    weather,
    cachedAt: Date.now(),
  })
}

async function fetchWeatherForLocation(location, { forceRefresh = false } = {}) {
  const key = weatherCacheKey(location)
  if (!forceRefresh) {
    const cached = readCachedWeather(key)
    if (cached) return cached
    const pending = weatherRequests.get(key)
    if (pending) return pending
  }

  const request = getWeather({
    latitude: location.latitude,
    longitude: location.longitude,
  })
    .then((weather) => {
      writeCachedWeather(key, weather)
      return weather
    })
    .finally(() => {
      if (weatherRequests.get(key) === request) {
        weatherRequests.delete(key)
      }
    })

  weatherRequests.set(key, request)
  return request
}

export default function WeatherBar({
  strings,
  location,
  locationStatus,
  locationErrorCode,
  onRefreshLocation,
  onFarmingAdvice,
}) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorCode, setErrorCode] = useState(null)
  const requestIdRef = useRef(0)

  const loadWeather = useCallback(
    async ({ forceRefresh = false } = {}) => {
      if (!location) return
      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId
      setLoading(true)
      setErrorCode(null)

      try {
        const nextWeather = await fetchWeatherForLocation(location, { forceRefresh })
        if (requestIdRef.current !== requestId) return
        setWeather(nextWeather)
      } catch {
        if (requestIdRef.current !== requestId) return
        setErrorCode('weather-unavailable')
      } finally {
        if (requestIdRef.current === requestId) setLoading(false)
      }
    },
    [location]
  )

  useEffect(() => {
    if (location) {
      loadWeather()
    }
  }, [location, loadWeather])

  const handleRefresh = useCallback(async () => {
    const refreshedLocation = await onRefreshLocation?.({ forceRefresh: true })
    if (!refreshedLocation && location) {
      loadWeather({ forceRefresh: true })
    }
  }, [loadWeather, location, onRefreshLocation])

  const isLocationLoading = !location && (locationStatus === 'idle' || locationStatus === 'loading')
  const isWeatherLoading = (loading || (location && !weather && !errorCode)) && !weather
  const locationUnavailable = !location && locationStatus === 'error'
  const weatherUnavailable = Boolean(errorCode)
  const error =
    locationUnavailable && locationErrorCode === 'geolocation-denied'
      ? strings.weatherDenied
      : strings.weatherUnavailable

  if (isLocationLoading || isWeatherLoading) {
    return <div className="weather-widget weather-loading">{strings.weatherLoading}</div>
  }

  if (locationUnavailable || weatherUnavailable) {
    return (
      <button type="button" className="weather-widget weather-error" onClick={handleRefresh}>
        <span className="weather-location">
          <MapPinIcon /> {location?.label || strings.locationUnavailable}
        </span>
        <span>{error}</span>
      </button>
    )
  }

  if (!location || !weather) {
    return <div className="weather-widget weather-loading">{strings.weatherLoading}</div>
  }

  return (
    <div className="weather-widget">
      <button
        type="button"
        className="weather-location weather-refresh-btn"
        onClick={handleRefresh}
        aria-label="Refresh location"
        title="Refresh location"
      >
        <MapPinIcon /> {location.label || strings.locationUnavailable}
      </button>
      <div className="weather-line">
        <span className="weather-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 16.5h11a3 3 0 10-.6-5.9A5 5 0 005.5 12" />
            <path d="M7 6.5V4M4.8 8.2 3 6.4M11 4.8 12.8 3" />
          </svg>
        </span>
        <span className="weather-temp">{Math.round(weather.temperature)}°C</span>
        <span className="weather-separator">•</span>
        <span className="weather-desc">{weather.description}</span>
        <span className="weather-separator">•</span>
        <span title={strings.humidityLabel}>
          {weather.humidity}% {strings.humidityLabel}
        </span>
        <span className="weather-separator">•</span>
        <span title={strings.windLabel}>
          {Math.round(weather.wind_speed)} km/h {strings.windLabel}
        </span>
        {weather.rain_probability > 0 && (
          <>
            <span className="weather-separator">•</span>
            <span title={strings.rainLabel}>{weather.rain_probability}% {strings.rainLabel}</span>
          </>
        )}
        {weather.farming_tip && (
          <>
            <span className="weather-separator">•</span>
            <button type="button" className="weather-tip-btn" onClick={() => onFarmingAdvice?.(weather)}>
              {weather.farming_tip}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
