const API_URL = import.meta.env.VITE_API_URL

// Po tylu milisekundach bez odpowiedzi serwera przerywamy zapytanie i pokazujemy komunikat,
// zamiast kręcić spinnerem w nieskończoność (wolne łącze, serwer nie odpowiada).
const REQUEST_TIMEOUT_MS = 15000

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

  // Brak sieci (np. tryb samolotowy): od razu czytelny komunikat, bez czekania na błąd przeglądarki.
  if (!navigator.onLine) {
    throw new ApiError('Brak połączenia z internetem. Sprawdź sieć i spróbuj ponownie.', 0, null)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('Serwer nie odpowiada. Spróbuj ponownie za chwilę.', 0, null)
    }
    throw new ApiError('Nie można połączyć się z serwerem.', 0, null)
  } finally {
    clearTimeout(timer)
  }

  if (response.status === 204) return null

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && auth && token) {
      clearTokens()
      window.dispatchEvent(new Event('auth:expired'))
    }
    if (response.status >= 500) {
      throw new ApiError('Wystąpił błąd serwera. Spróbuj ponownie za chwilę.', response.status, data)
    }
    throw new ApiError(extractMessage(data), response.status, data)
  }
  return data
}