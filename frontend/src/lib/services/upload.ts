import api from '@/lib/axios'
import { validateAndCorrectImageFile } from '@/lib/utils/image-validator'

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
    // Validate and correct the image file
    const validation = validateAndCorrectImageFile(file)
    
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid image file')
    }
    
    const correctedFile = validation.correctedFile!
    const formData = new FormData()
    formData.append('file', correctedFile)
    const response = await api.post('/upload/du/single/image', formData, {
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
