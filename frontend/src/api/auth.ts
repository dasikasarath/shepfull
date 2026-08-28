import { apiText } from './client'
import type {
  PasswordsetDto,
  UserDto,
  UserEntity,
  VerifyotpDto,
} from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
export const GOOGLE_AUTH_URL = `${API_BASE}/oauth2/authorization/google`

export async function sendRegistrationOtp(email: string): Promise<string> {
  return apiText('/user/register/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }, false)
}

export async function verifyRegistrationOtp(email: string, otp: string): Promise<string> {
  return apiText('/user/register/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  }, false)
}

export async function register(data: UserEntity): Promise<string> {
  return apiText('/user/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }, false)
}

export async function login(data: UserDto): Promise<string> {
  return apiText('/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }, false)
}

export async function logout(): Promise<string> {
  return apiText('/logouts', { method: 'POST' })
}

export async function generateOtp(name: string): Promise<string> {
  return apiText(`/forgotpassword/generateotp/${encodeURIComponent(name)}`, {
    method: 'POST',
  }, false)
}

export async function verifyOtp(data: VerifyotpDto): Promise<string> {
  return apiText('/forgotpassword/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  }, false)
}

export async function resetPassword(data: PasswordsetDto): Promise<string> {
  return apiText('/forgotpassword/passwordchange', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, false)
}
