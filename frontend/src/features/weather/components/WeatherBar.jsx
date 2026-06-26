import { useState, useEffect, useCallback, useRef } from 'react'
import { MapPinIcon } from '../../../components/common/Icons.jsx'
import { getWeather, reverseGeocode } from '../../../services/api/weatherApi.js'

const weatherRequestCache = {
  promise: null,
  result: null,
}

function getGeolocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('geolocation-unavailable'))
      return
    }

    let settled = false
    const timeoutMs = options.timeout || 10000
    const timeoutId = window.setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error('geolocation-timeout'))
    }, timeoutMs + 1000)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (settled) return
        settled = true
        window.clearTimeout(timeoutId)
        resolve(position)
      },
      (error) => {
        if (settled) return
        settled = true
        window.clearTimeout(timeoutId)
        reject(error)
      },
      options
    )
  })
}

async function fetchLocalWeather(language, options = {}) {
  if (!options.forceRefresh) {
    if (weatherRequestCache.result) return weatherRequestCache.result
    if (weatherRequestCache.promise) return weatherRequestCache.promise
  }

  const requestPromise = (async () => {
    try {
      const pos = await getGeolocation({
        timeout: 10000,
        maximumAge: options.forceRefresh ? 0 : 600000,
        enableHighAccuracy: false,
      })
      const { latitude, longitude } = pos.coords
      const [weatherResult, locationResult] = await Promise.allSettled([
        getWeather({ latitude, longitude }),
        reverseGeocode({ latitude, longitude, language }),
      ])

      const location =
        locationResult.status === 'fulfilled'
          ? locationResult.value
          : null
      const city = location?.city || location?.locality || location?.principalSubdivision
      const region = location?.countryName || location?.principalSubdivision
      const locationLabel = [city, region].filter(Boolean).join(', ') || null

      if (weatherResult.status !== 'fulfilled') throw new Error('Weather fetch failed')

      return {
        weather: weatherResult.value,
        locationLabel,
        errorCode: null,
      }
    } catch (error) {
      return {
        weather: null,
        locationLabel: null,
        errorCode: error?.message === 'geolocation-unavailable' ? 'unavailable' : 'denied',
      }
    }
  })()
  weatherRequestCache.promise = requestPromise

  const result = await requestPromise
  if (weatherRequestCache.promise === requestPromise) {
    if (result.weather) weatherRequestCache.result = result
    weatherRequestCache.promise = null
  }
  return result
}

export default function WeatherBar({ strings, onFarmingAdvice }) {
  const [weather, setWeather] = useState(null)
  const [locationLabel, setLocationLabel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorCode, setErrorCode] = useState(null)
  const initialFetchStartedRef = useRef(false)
  const requestLanguageRef = useRef(strings.dir === 'rtl' ? 'ar' : 'en')

  const applyWeatherResult = useCallback((result) => {
    setWeather(result.weather)
    setLocationLabel(result.locationLabel)
    setErrorCode(result.errorCode)
  }, [])

  const loadWeather = useCallback(
    async ({ forceRefresh = false } = {}) => {
      if (!forceRefresh && initialFetchStartedRef.current) return
      initialFetchStartedRef.current = true
      setLoading(true)

      const result = await fetchLocalWeather(requestLanguageRef.current, { forceRefresh })
      applyWeatherResult(result)
      setLoading(false)
    },
    [applyWeatherResult]
  )

  useEffect(() => {
    let isMounted = true

    async function loadInitialWeather() {
      if (!weatherRequestCache.result && !weatherRequestCache.promise) setLoading(true)
      const result = await fetchLocalWeather(requestLanguageRef.current)
      if (!isMounted) return
      initialFetchStartedRef.current = true
      applyWeatherResult(result)
      setLoading(false)
    }

    if (!initialFetchStartedRef.current) {
      initialFetchStartedRef.current = true
      loadInitialWeather()
    }

    return () => {
      isMounted = false
    }
  }, [applyWeatherResult])

  const error = errorCode === 'denied' ? strings.weatherDenied : strings.weatherUnavailable

  if (loading) {
    return <div className="weather-widget weather-loading">{strings.weatherLoading}</div>
  }

  if (error || !weather) {
    return (
      <button
        type="button"
        className="weather-widget weather-error"
        onClick={() => loadWeather({ forceRefresh: true })}
      >
        <span className="weather-location">
          <MapPinIcon /> {locationLabel || strings.locationUnavailable}
        </span>
        <span>{error || strings.weatherUnavailable}</span>
      </button>
    )
  }

  return (
    <div className="weather-widget">
      <button
        type="button"
        className="weather-location weather-refresh-btn"
        onClick={() => loadWeather({ forceRefresh: true })}
        aria-label="Refresh location"
        title="Refresh location"
      >
        <MapPinIcon /> {locationLabel || strings.locationUnavailable}
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
