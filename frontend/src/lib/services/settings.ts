import api from '@/lib/axios'

export interface Setting {
  _id: string
  key: string
  value: any
  description?: string
  category: 'general' | 'export' | 'system'
  createdAt: string
  updatedAt: string
}

export interface ExportTemplate {
  key: string
  resource: string
  description?: string
  hasFile: boolean
}

export interface SettingsResponse {
  total: number
  items: Setting[]
}

export const settingsService = {
  // Get all settings
  getList: async (params?: {
    pageIndex?: number
    pageSize?: number
    search?: string
    category?: string
  }): Promise<SettingsResponse> => {
    const response = await api.get('/settings', { params })
    return response.data
  },

  // Get setting by key
  getByKey: async (key: string): Promise<Setting> => {
    const response = await api.get(`/settings/key/${key}`)
    return response.data
  },

  // Get settings by category
  getByCategory: async (category: string): Promise<Setting[]> => {
    const response = await api.get(`/settings/category/${category}`)
    return response.data
  },

  // Create or update setting
  upsert: async (data: {
    key: string
    value: any
    description?: string
    category?: string
  }): Promise<Setting> => {
    const response = await api.post('/settings', data)
    return response.data
  },

  // Delete setting
  delete: async (key: string): Promise<{ message: string }> => {
    const response = await api.delete(`/settings/${key}`)
    return response.data
  },

  // Get available export templates
  getExportTemplates: async (): Promise<ExportTemplate[]> => {
    const response = await api.get('/settings/export/templates')
    return response.data
  },

  // Export with template
  exportWithTemplate: async (data: {
    resource: string
    data: any[]
    filename?: string
  }): Promise<Blob> => {
    const response = await api.post('/settings/export', data, {
      responseType: 'blob',
    })
    return response.data
  },
}
