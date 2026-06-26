import { API_BASE_URL, parseJsonResponse } from './client.js'

export async function sendChatRequest({ message, image, language, intent, history }) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, image, language, intent, history }),
  })

  return parseJsonResponse(response)
}
