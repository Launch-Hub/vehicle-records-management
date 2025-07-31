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

export interface FileItem {
  name: string
  type: 'file' | 'directory'
  path: string
  size: number | null
  modified: string
  url?: string
}

export interface ListFilesResponse {
  currentPath: string
  parentPath: string | null
  items: FileItem[]
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

  listFiles: async (directory: string = ''): Promise<ListFilesResponse> => {
    const response = await api.get('/upload/list', {
      params: { directory },
    })
    return response.data
  },
}
