import { useCallback, useEffect, useState } from 'react'
import { getMe, login as apiLogin } from '../api/auth'
import { clearTokens, hasToken } from '../api/client'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(hasToken())

  useEffect(() => {
    if (!hasToken()) return
    getMe()
      .then(setUser)
      .catch((err) => {
        // Token kasujemy tylko wtedy, gdy serwer faktycznie go odrzucił (401).
        // Chwilowa awaria sieci lub błąd 500 nie powinny wylogowywać użytkownika.
        if (err.status === 401) clearTokens()
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onExpired = () => setUser(null)
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  const login = useCallback(async (username, password) => {
    await apiLogin(username, password)
    setUser(await getMe())
  }, [])

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}