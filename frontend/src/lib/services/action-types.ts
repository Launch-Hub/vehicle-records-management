import api from '@/lib/axios'
import type { ActionType } from '@/lib/types/tables.type'

export interface ActionTypeListResponse {
  total: number
  items: ActionType[]
}

export interface ActionTypeListParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  step?: number
}

export const actionTypeService = {
  // Get list of action types
  getList: async (params?: ActionTypeListParams): Promise<ActionTypeListResponse> => {
    const response = await api.get('/action-types', { params })
    return response.data
  },

  // Get single action type
  getOne: async (id: string): Promise<ActionType> => {
    const response = await api.get(`/action-types/${id}`)
    return response.data
  },

  // Create new action type
  create: async (data: Partial<ActionType>): Promise<ActionType> => {
    const response = await api.post('/action-types', data)
    return response.data
  },

  // Create multiple action types
  createBulk: async (actionTypes: Partial<ActionType>[]): Promise<{ message: string; items: ActionType[] }> => {
    const response = await api.post('/action-types/bulk', { actionTypes })
    return response.data
  },

  // Update action type
  update: async (id: string, data: Partial<ActionType>): Promise<ActionType> => {
    const response = await api.put(`/action-types/${id}`, data)
    return response.data
  },

  // Delete action type
  delete: async (id: string): Promise<void> => {
    await api.delete(`/action-types/${id}`)
  },
} 