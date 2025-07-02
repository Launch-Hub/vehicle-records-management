import api from '@/lib/axios'
import type { Procedure } from '@/lib/types/tables.type'

export interface ProcedureListResponse {
  total: number
  items: Procedure[]
}

export interface ProcedureListParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  step?: number
}

export const procedureService = {
  getList: async (params?: ProcedureListParams): Promise<ProcedureListResponse> => {
    const response = await api.get('/procedures', { params })
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/procedures/${id}`)
  },
  getOne: async (id: string): Promise<Procedure> => {
    const response = await api.get(`/procedures/${id}`)
    return response.data
  },
  create: async (data: Partial<Procedure>): Promise<Procedure> => {
    const response = await api.post('/procedures', data)
    return response.data
  },
  update: async (id: string, data: Partial<Procedure>): Promise<Procedure> => {
    const response = await api.put(`/procedures/${id}`, data)
    return response.data
  },
} 