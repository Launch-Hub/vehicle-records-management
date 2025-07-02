import api from '@/lib/axios'
import type { VehicleRecord } from '@/lib/types/tables.type'

export interface RecordListResponse {
  total: number
  items: VehicleRecord[]
}

export interface RecordListParams {
  pageIndex?: number
  pageSize?: number
  search?: string
}

export const recordService = {
  getList: async (params?: RecordListParams): Promise<RecordListResponse> => {
    const response = await api.get('/records', { params })
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/records/${id}`)
  },
} 