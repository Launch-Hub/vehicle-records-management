import api from '@/lib/axios'
import type { PlateRequest } from '@/lib/types/tables.type'

export interface PlateRequestListResponse {
  total: number
  items: PlateRequest[]
}

export interface PlateRequestListParams {
  pageIndex?: number
  pageSize?: number
  search?: string
  bulk?: string
  color?: string
  vehicleType?: string
  letter?: string
  suffixNumber?: string
  createdBy?: string
  updatedBy?: string
}

const resource = '/plate-requests'

export const plateRequestService = {
  getList: async (params?: PlateRequestListParams): Promise<PlateRequestListResponse> => {
    const response = await api.get(resource, { params })
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`${resource}/${id}`)
  },
  getOne: async (id: string): Promise<PlateRequest> => {
    const response = await api.get(`${resource}/${id}`)
    return response.data
  },
  create: async (data: Partial<PlateRequest>): Promise<PlateRequest> => {
    const response = await api.post(resource, data)
    return response.data
  },
  update: async (id: string, data: Partial<PlateRequest>): Promise<PlateRequest> => {
    const response = await api.put(`${resource}/${id}`, data)
    return response.data
  },
} 