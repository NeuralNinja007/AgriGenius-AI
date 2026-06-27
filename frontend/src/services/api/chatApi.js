import { API_BASE_URL, parseJsonResponse } from './client.js'

const CHAT_TIMEOUT_MS = 75000

export async function sendChatRequest({ message, image, language, intent, location, history }) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, image, language, intent, location, history }),
      signal: controller.signal,
    })

    return parseJsonResponse(response)
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('The AI service is taking too long to respond. Please try again.')
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}
