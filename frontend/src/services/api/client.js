export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export async function parseJsonResponse(response) {
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(body.detail || `Request failed (${response.status})`)
  }
  return body
}
