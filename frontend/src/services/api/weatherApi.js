import { API_BASE_URL, parseJsonResponse } from './client.js'

export async function getWeather({ latitude, longitude }, options = {}) {
  const response = await fetch(`${API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}`, {
    signal: options.signal,
  })
  return parseJsonResponse(response)
}

export async function reverseGeocode({ latitude, longitude, language }, options = {}) {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${language}`,
    { signal: options.signal }
  )
  return parseJsonResponse(response)
}
