const API_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

export function saveTokens({ access, refresh }) {
  localStorage.setItem('access', access)
  localStorage.setItem('refresh', refresh)
}

export function clearTokens() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
}

export function hasToken() {
  return Boolean(localStorage.getItem('access'))
}

function extractMessage(data) {
  if (!data) return 'Wystąpił błąd serwera.'
  if (typeof data.detail === 'string') return data.detail
  const parts = Object.values(data).flatMap((value) =>
    Array.isArray(value) ? value : [String(value)],
  )
  return parts.join(' ') || 'Wystąpił błąd.'
}

export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = localStorage.getItem('access')
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Nie można połączyć się z serwerem.', 0, null)
  }

  if (response.status === 204) return null

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && auth && token) {
      clearTokens()
      window.dispatchEvent(new Event('auth:expired'))
    }
    throw new ApiError(extractMessage(data), response.status, data)
  }
  return data
}