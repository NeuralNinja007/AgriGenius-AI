import { useCallback, useEffect, useRef, useState } from 'react'
import { reverseGeocode } from '../../services/api/weatherApi.js'

const LOCATION_CACHE_KEY = 'agrigenius.detectedLocation.v1'
const LOCATION_CACHE_TTL_MS = 10 * 60 * 1000
const GEOLOCATION_TIMEOUT_MS = 10000
const REVERSE_GEOCODE_TIMEOUT_MS = 10000

const COUNTRY_DISPLAY_NAMES = {
  AE: 'UAE',
  SA: 'Saudi Arabia',
}

const COUNTRY_CURRENCIES = {
  SA: 'SAR',
  AE: 'AED',
  QA: 'QAR',
  KW: 'KWD',
  BH: 'BHD',
  OM: 'OMR',
  IN: 'INR',
  PK: 'PKR',
  EG: 'EGP',
}

const GCC_COUNTRY_CODES = new Set(['SA', 'AE', 'QA', 'KW', 'BH', 'OM'])

let locationRequestPromise = null

function readCachedLocation() {
  try {
    const cached = JSON.parse(window.localStorage.getItem(LOCATION_CACHE_KEY) || 'null')
    if (!cached?.location || !cached.cachedAt) return null
    if (Date.now() - cached.cachedAt > LOCATION_CACHE_TTL_MS) return null
    return cached.location
  } catch {
    return null
  }
}

function writeCachedLocation(location) {
  try {
    window.localStorage.setItem(
      LOCATION_CACHE_KEY,
      JSON.stringify({
        location,
        cachedAt: Date.now(),
      })
    )
  } catch {
    // Location is a convenience cache only. Ignore storage failures.
  }
}

function compactParts(parts) {
  const normalized = []
  for (const part of parts) {
    const value = typeof part === 'string' ? part.trim() : ''
    if (!value) continue
    if (normalized.some((existing) => existing.toLowerCase() === value.toLowerCase())) continue
    normalized.push(value)
  }
  return normalized
}

function displayCountryName(countryName, countryCode) {
  return COUNTRY_DISPLAY_NAMES[countryCode] || countryName || countryCode || ''
}

function inferCurrency(countryCode) {
  return COUNTRY_CURRENCIES[countryCode] || 'SAR'
}

function normalizeLocation({ latitude, longitude, geocode }) {
  const countryCode = geocode?.countryCode || ''
  const country = geocode?.countryName || ''
  const city =
    geocode?.city ||
    geocode?.locality ||
    geocode?.principalSubdivision ||
    geocode?.localityInfo?.administrative?.find((item) => item.order === 8)?.name ||
    ''
  const stateProvince =
    geocode?.principalSubdivision && geocode.principalSubdivision !== city
      ? geocode.principalSubdivision
      : ''
  const displayCountry = displayCountryName(country, countryCode)
  const labelState = GCC_COUNTRY_CODES.has(countryCode) ? '' : stateProvince
  const label = compactParts([city, labelState, displayCountry]).join(', ') || 'Location detected'

  return {
    latitude,
    longitude,
    city,
    stateProvince,
    country,
    countryCode,
    currency: inferCurrency(countryCode),
    label,
    detectedAt: new Date().toISOString(),
  }
}

function getGeolocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('geolocation-unavailable'))
      return
    }

    let settled = false
    const timeoutMs = options.timeout || GEOLOCATION_TIMEOUT_MS
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

async function getPermissionState() {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) return 'unknown'

  try {
    const status = await navigator.permissions.query({ name: 'geolocation' })
    return status.state
  } catch {
    return 'unknown'
  }
}

async function reverseGeocodeWithTimeout({ latitude, longitude, language }) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REVERSE_GEOCODE_TIMEOUT_MS)

  try {
    return await reverseGeocode({ latitude, longitude, language }, { signal: controller.signal })
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function detectLocation(language, { forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = readCachedLocation()
    if (cached) return cached
    if (locationRequestPromise) return locationRequestPromise
  }

  const requestPromise = (async () => {
    const permissionState = await getPermissionState()
    if (permissionState === 'denied') throw new Error('geolocation-denied')

    const position = await getGeolocation({
      timeout: GEOLOCATION_TIMEOUT_MS,
      maximumAge: forceRefresh ? 0 : LOCATION_CACHE_TTL_MS,
      enableHighAccuracy: false,
    })

    const { latitude, longitude } = position.coords
    const geocode = await reverseGeocodeWithTimeout({ latitude, longitude, language })
    const location = normalizeLocation({ latitude, longitude, geocode })
    writeCachedLocation(location)
    return location
  })()
  locationRequestPromise = requestPromise

  try {
    return await requestPromise
  } finally {
    if (locationRequestPromise === requestPromise) {
      locationRequestPromise = null
    }
  }
}

export function useDetectedLocation(language) {
  const [location, setLocation] = useState(() => readCachedLocation())
  const [status, setStatus] = useState(location ? 'ready' : 'idle')
  const [errorCode, setErrorCode] = useState(null)
  const requestIdRef = useRef(0)
  const languageRef = useRef(language)

  useEffect(() => {
    languageRef.current = language
  }, [language])

  const refreshLocation = useCallback(async ({ forceRefresh = false } = {}) => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setStatus('loading')
    setErrorCode(null)

    try {
      const nextLocation = await detectLocation(languageRef.current, { forceRefresh })
      if (requestIdRef.current !== requestId) return null
      setLocation(nextLocation)
      setStatus('ready')
      return nextLocation
    } catch (error) {
      if (requestIdRef.current !== requestId) return null
      setErrorCode(error?.message || 'location-unavailable')
      setStatus('error')
      return null
    }
  }, [])

  useEffect(() => {
    if (!location) {
      refreshLocation()
    }
  }, [location, refreshLocation])

  useEffect(() => {
    if (!location?.detectedAt) return undefined

    const detectedAt = Date.parse(location.detectedAt)
    const age = Number.isNaN(detectedAt) ? LOCATION_CACHE_TTL_MS : Date.now() - detectedAt
    const refreshDelay = Math.max(LOCATION_CACHE_TTL_MS - age, 0)
    const timeoutId = window.setTimeout(() => {
      refreshLocation({ forceRefresh: true })
    }, refreshDelay)

    return () => window.clearTimeout(timeoutId)
  }, [location, refreshLocation])

  return {
    location,
    status,
    errorCode,
    refreshLocation,
  }
}
