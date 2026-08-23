import { apiRequest, apiText } from './client'
import type { PasswordDto, ProfileDto, UpdateProfileDto } from '../types'

export async function getProfile(): Promise<ProfileDto> {
  return apiRequest<ProfileDto>('/user/me')
}

export async function updateProfile(data: UpdateProfileDto): Promise<string> {
  return apiText('/updateprofile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function changePassword(data: PasswordDto): Promise<string> {
  return apiText('/rechangepassword', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}
