import { apiRequest } from './client'
import type { UserEntity } from '../types'

export async function getAllUsers(): Promise<UserEntity[]> {
  return apiRequest<UserEntity[]>('/admin/showusers')
}
