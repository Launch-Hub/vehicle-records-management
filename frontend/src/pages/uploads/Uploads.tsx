import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  FolderIcon,
  FileIcon,
  ArrowLeftIcon,
  HomeIcon,
  DownloadIcon,
  EyeIcon,
  CalendarIcon,
  HardDriveIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { uploadService, type FileItem, type ListFilesResponse } from '@/lib/services/upload'
import { formatBytes, formatDate } from '@/lib/utils'

export default function UploadsPage() {
  const [files, setFiles] = useState<ListFilesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const currentDirectory = searchParams.get('dir') || ''

  useEffect(() => {
    loadFiles()
  }, [currentDirectory])

  const loadFiles = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await uploadService.listFiles(currentDirectory)
      setFiles(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const navigateToDirectory = (path: string) => {
    setSearchParams({ dir: path })
  }

  const goToParent = () => {
    if (files?.parentPath !== null) {
      setSearchParams({ dir: files?.parentPath || '' })
    } else {
      setSearchParams({})
    }
  }

  const goToRoot = () => {
    setSearchParams({})
  }

  const handleFileClick = (item: FileItem) => {
    if (item.type === 'directory') {
      navigateToDirectory(item.path)
    } else if (item.url) {
      window.open(item.url, '_blank')
    }
  }

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'directory') {
      return <FolderIcon className="h-5 w-5 text-blue-500" />
    }
    return <FileIcon className="h-5 w-5 text-gray-500" />
  }

  const getFileActions = (item: FileItem) => {
    if (item.type === 'file' && item.url) {
      return (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              window.open(item.url, '_blank')
            }}
            title="View file"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              const link = document.createElement('a')
              link.href = item.url!
              link.download = item.name
              link.click()
            }}
            title="Download file"
          >
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={loadFiles}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <HardDriveIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">File Manager</h1>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {files?.parentPath !== null && (
            <Button variant="outline" size="sm" onClick={goToRoot} title="Go to root">
              <HomeIcon className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={goToParent} title="Go to parent directory">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      {currentDirectory && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Đường dẫn:</span>
            {currentDirectory.split('/').map((part, index, parts) => {
              if (!part) return null
              const path = parts.slice(0, index + 1).join('/')
              return (
                <div key={index} className="flex items-center gap-2">
                  <span>\</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => navigateToDirectory(path)}
                  >
                    {part === '.' ? '' : part}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* File List */}
      <div className="grid gap-2">
        {files?.items.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <FolderIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Thư mục này trống</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          files?.items.map((item) => (
            <Card
              key={item.path}
              className="cursor-pointer hover:bg-muted/50 transition-colors py-0"
              onClick={() => handleFileClick(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(item)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{item.name}</p>
                        <Badge variant={item.type === 'directory' ? 'default' : 'secondary'}>
                          {item.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {item.size !== null && (
                          <span className="flex items-center gap-1">
                            <HardDriveIcon className="h-3 w-3" />
                            {formatBytes(item.size)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {formatDate(new Date(item.modified))}
                        </span>
                      </div>
                    </div>
                  </div>
                  {getFileActions(item)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
