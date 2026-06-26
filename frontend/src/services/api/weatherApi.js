import { API_BASE_URL, parseJsonResponse } from './client.js'

export async function getWeather({ latitude, longitude }) {
  const response = await fetch(`${API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}`)
  return parseJsonResponse(response)
}

export async function reverseGeocode({ latitude, longitude, language }) {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${language}`
  )
  return parseJsonResponse(response)
}
