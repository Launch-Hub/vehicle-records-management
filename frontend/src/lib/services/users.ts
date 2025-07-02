import api from '@/lib/axios'
import type { User } from '@/lib/types/tables.type'

export interface UserListResponse {
  total: number
  items: User[]
}

export interface UserListParams {
  pageIndex?: number
  pageSize?: number
  search?: string
}

export const userService = {
  getList: async (params?: UserListParams): Promise<UserListResponse> => {
    const response = await api.get('/users', { params })
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
  getOne: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },
  create: async (data: Partial<User>): Promise<User> => {
    const response = await api.post('/users', data)
    return response.data
  },
  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },
} 