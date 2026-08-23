import { apiText } from './client'
import type {
  PasswordsetDto,
  UserDto,
  UserEntity,
  VerifyotpDto,
} from '../types'

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
