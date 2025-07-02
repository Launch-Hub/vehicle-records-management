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
} 