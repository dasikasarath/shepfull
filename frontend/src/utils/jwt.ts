import type { AuthUser } from '../types'

export function parseJwt(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return {
      name: decoded.sub,
      id: decoded.id,
      role: decoded.role as 'USER' | 'ADMIN',
    }
  } catch {
    return null
  }
}

export function isJwtToken(value: string): boolean {
  return value.split('.').length === 3 && !value.includes(' ')
}
