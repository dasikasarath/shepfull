import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AuthUser } from '../types'
import { parseJwt } from '../utils/jwt'
import * as authApi from '../api/auth'
import { isJwtToken } from '../utils/jwt'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (name: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStoredAuth(): { token: string | null; user: AuthUser | null } {
  const token = localStorage.getItem('token')
  if (!token) return { token: null, user: null }
  const user = parseJwt(token)
  if (!user) {
    localStorage.removeItem('token')
    return { token: null, user: null }
  }
  return { token, user }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = loadStoredAuth()
  const [token, setToken] = useState<string | null>(stored.token)
  const [user, setUser] = useState<AuthUser | null>(stored.user)

  const login = useCallback(async (name: string, password: string) => {
    const response = await authApi.login({ name, password })
    if (!isJwtToken(response)) {
      throw new Error(response)
    }
    const parsed = parseJwt(response)
    if (!parsed) {
      throw new Error('Invalid token received')
    }
    localStorage.setItem('token', response)
    setToken(response)
    setUser(parsed)
    return parsed
  }, [])

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authApi.logout()
      }
    } catch {
      // Clear local session even if backend logout fails
    } finally {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    }
  }, [token])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isAdmin: user?.role === 'ADMIN',
      login,
      logout,
    }),
    [user, token, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
