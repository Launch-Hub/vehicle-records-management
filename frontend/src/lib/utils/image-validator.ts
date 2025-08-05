export interface ImageValidationResult {
  isValid: boolean
  error?: string
  correctedFile?: File
}

export const validateAndCorrectImageFile = (file: File): ImageValidationResult => {
  // Check if it's actually an image
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: 'File is not an image'
    }
  }

  // Define allowed image types and their extensions
  const allowedTypes = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
  }

  // Check if the MIME type is supported
  if (!allowedTypes[file.type as keyof typeof allowedTypes]) {
    return {
      isValid: false,
      error: `Unsupported image type: ${file.type}. Supported types: ${Object.keys(allowedTypes).join(', ')}`
    }
  }

  // Get the expected extension for this MIME type
  const expectedExtension = allowedTypes[file.type as keyof typeof allowedTypes]
  
  // Get the current file extension
  const currentName = file.name
  const currentExtension = currentName.substring(currentName.lastIndexOf('.')).toLowerCase()
  
  // If the file already has the correct extension, return as is
  if (currentExtension === expectedExtension) {
    return {
      isValid: true,
      correctedFile: file
    }
  }

  // If the file has no extension or wrong extension, create a new file with correct extension
  const baseName = currentName.substring(0, currentName.lastIndexOf('.')) || currentName
  const correctedName = baseName + expectedExtension
  
  // Create a new File object with the corrected name
  const correctedFile = new File([file], correctedName, {
    type: file.type,
    lastModified: file.lastModified
  })

  return {
    isValid: true,
    correctedFile
  }
}

export const validateImageFile = (file: File): ImageValidationResult => {
  return validateAndCorrectImageFile(file)
} 