function normalizeApiBaseUrl(value) {
  const baseUrl = (value || '/api').trim()
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)

export async function parseJsonResponse(response) {
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(body.detail || `Request failed (${response.status})`)
  }
  return body
}
