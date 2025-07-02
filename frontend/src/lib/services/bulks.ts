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
} 