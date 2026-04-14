import { useEffect, useMemo, useState } from 'react'
import { authApi, setAuthToken } from '../services/api'
import httpClient from '../utils/httpClient'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('lingualearn-token') || '')
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!token) {
      // only clear if no clerk token is already set
      const current = httpClient.defaults.headers.common.Authorization || ''
      if (!current.includes('clerk:')) setAuthToken(null)
      return
    }
    setAuthToken(token)
    authApi
      .me()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem('lingualearn-token')
        setToken('')
        setUser(null)
      })
  }, [token])

  const login = async (email, password) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('lingualearn-token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const signup = async (payload) => {
    const data = await authApi.signup(payload)
    localStorage.setItem('lingualearn-token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('lingualearn-token')
    setToken('')
    setAuthToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, signup, logout, setUser }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
