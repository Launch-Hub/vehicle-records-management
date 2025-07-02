import api from '@/lib/axios'

export interface UploadResponse {
  status: string
  message: string
  file: {
    originalName: string
    storedName: string
    size: number
    type: string
  }
}

export const uploadService = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/uploads/du/single/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
} 