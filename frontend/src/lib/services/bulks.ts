import api from '@/lib/axios'
import type { Bulk } from '@/lib/types/tables.type'

export interface BulkListResponse {
  total: number
  items: Bulk[]
}

export interface BulkListParams {
  pageIndex?: number
  pageSize?: number
  search?: string
}

export const bulkService = {
  getList: async (params?: BulkListParams): Promise<BulkListResponse> => {
    const response = await api.get('/bulks', { params })
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/bulks/${id}`)
  },
  getOne: async (id: string): Promise<Bulk> => {
    const response = await api.get(`/bulks/${id}`)
    return response.data
  },
  create: async (data: Partial<Bulk>): Promise<Bulk> => {
    const response = await api.post('/bulks', data)
    return response.data
  },
  update: async (id: string, data: Partial<Bulk>): Promise<Bulk> => {
    const response = await api.put(`/bulks/${id}`, data)
    return response.data
  },
} 