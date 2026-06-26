import { useState, useEffect } from 'react'
import { MapPinIcon } from '../../../components/common/Icons.jsx'
import { getWeather, reverseGeocode } from '../../../services/api/weatherApi.js'

export default function WeatherBar({ strings, onFarmingAdvice }) {
  const [weather, setWeather] = useState(null)
  const [locationLabel, setLocationLabel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationLabel(strings.locationUnavailable)
      setError(strings.weatherUnavailable)
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const [weatherResult, locationResult] = await Promise.allSettled([
            getWeather({ latitude, longitude }),
            reverseGeocode({ latitude, longitude, language: strings.dir === 'rtl' ? 'ar' : 'en' }),
          ])

          if (locationResult.status === 'fulfilled') {
            const location = locationResult.value
            const city = location.city || location.locality || location.principalSubdivision
            const region = location.countryName || location.principalSubdivision
            setLocationLabel([city, region].filter(Boolean).join(', ') || strings.locationUnavailable)
          } else {
            setLocationLabel(strings.locationUnavailable)
          }

          if (weatherResult.status !== 'fulfilled') throw new Error('Weather fetch failed')
          setWeather(weatherResult.value)
          setError(null)
        } catch {
          setError(strings.weatherUnavailable)
        } finally {
          setLoading(false)
        }
      },
      () => {
        setLocationLabel(strings.locationUnavailable)
        setError(strings.weatherDenied)
        setLoading(false)
      },
      { timeout: 10000, maximumAge: 600000 }
    )
  }, [strings.dir, strings.locationUnavailable, strings.weatherUnavailable, strings.weatherDenied])

  if (loading) {
    return <div className="weather-widget weather-loading">{strings.weatherLoading}</div>
  }

  if (error || !weather) {
    return (
      <button type="button" className="weather-widget weather-error" onClick={() => onFarmingAdvice?.()}>
        <span className="weather-location">
          <MapPinIcon /> {locationLabel || strings.locationUnavailable}
        </span>
        <span>{error || strings.weatherUnavailable}</span>
      </button>
    )
  }

  return (
    <div className="weather-widget">
      <div className="weather-location">
        <MapPinIcon /> {locationLabel || strings.locationUnavailable}
      </div>
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
