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
  plateNumber?: string
  status?: string
  fromDate?: Date
  toDate?: Date
}

const resource = '/records'

export const recordService = {
  getList: async (params?: RecordListParams): Promise<RecordListResponse> => {
    const response = await api.get(resource, { params })
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`${resource}/${id}`)
  },
  getOne: async (id: string): Promise<VehicleRecord> => {
    const response = await api.get(`${resource}/${id}`)
    return response.data
  },
  create: async (data: Partial<VehicleRecord>): Promise<VehicleRecord> => {
    const response = await api.post(resource, data)
    return response.data
  },
  update: async (id: string, data: Partial<VehicleRecord>): Promise<VehicleRecord> => {
    const response = await api.put(`${resource}/${id}`, data)
    return response.data
  },
  searchBy: async (params: RecordListParams): Promise<VehicleRecord> => {
    const response = await api.post(`${resource}/search`, params)
    return response.data
  },
} 