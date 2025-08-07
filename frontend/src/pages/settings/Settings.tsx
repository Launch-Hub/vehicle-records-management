import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { settingsService, type Setting, type ExportTemplate } from '@/lib/services/settings'
import { uploadService } from '@/lib/services/upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UploadIcon, FileIcon, Trash2Icon, SettingsIcon, DatabaseIcon } from 'lucide-react'

export default function SettingsPage() {
  const [exportTemplates, setExportTemplates] = useState<ExportTemplate[]>([])
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [templates, exportSettings] = await Promise.all([
        settingsService.getExportTemplates(),
        settingsService.getByCategory('export'),
      ])
      setExportTemplates(templates)
      setSettings(exportSettings)
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Không thể tải cài đặt')
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateUpload = async (resource: string, file: File) => {
    if (!file) return

    setUploading(resource)
    try {
      // Upload the file
      const formData = new FormData()
      formData.append('file', file)
      const uploadResponse = await uploadService.uploadDocument(formData)

      // Save the template path in settings
      const templateKey = `export_template_${resource}`
      await settingsService.upsert({
        key: templateKey,
        value: uploadResponse.file.storedName,
        description: `Template Excel cho ${resource}`,
        category: 'export',
      })

      toast.success('Tải lên template thành công')
      loadData()
    } catch (error) {
      console.error('Failed to upload template:', error)
      toast.error('Không thể tải lên template')
    } finally {
      setUploading(null)
    }
  }

  const handleTemplateDelete = async (resource: string) => {
    try {
      const templateKey = `export_template_${resource}`
      await settingsService.delete(templateKey)
      toast.success('Xóa template thành công')
      loadData()
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast.error('Không thể xóa template')
    }
  }

  const getResourceLabel = (resource: string) => {
    const labels: Record<string, string> = {
      vehicle_records: 'Hồ sơ xe',
      users: 'Người dùng',
      procedures: 'Quy trình',
      bulks: 'Lô hồ sơ',
      plate_requests: 'Yêu cầu biển số',
    }
    return labels[resource] || resource
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Cài đặt</h1>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Đang tải...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Tabs defaultValue="export" className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export">Mẫu Excel</TabsTrigger>
          <TabsTrigger value="system">Cài đặt hệ thống</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseIcon className="h-5 w-5" />
                Quản lý mẫu Excel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tải lên các file mẫu Excel (.xlsx) để sử dụng khi xuất dữ liệu. Mẫu sẽ được sử dụng
                để định dạng file xuất theo ý muốn.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {exportTemplates.map((template) => (
                  <Card key={template.key} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileIcon className="h-4 w-4" />
                          <span className="font-medium">{getResourceLabel(template.resource)}</span>
                          {template.hasFile ? (
                            <Badge variant="default" className="text-xs">
                              Đã có template
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Chưa có template
                            </Badge>
                          )}
                        </div>
                        {template.description && (
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {template.hasFile ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTemplateDelete(template.resource)}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept=".xlsx,.xls"
                              className="hidden"
                              id={`template-${template.resource}`}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  handleTemplateUpload(template.resource, file)
                                }
                              }}
                            />
                            <Label
                              htmlFor={`template-${template.resource}`}
                              className="cursor-pointer"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={uploading === template.resource}
                              >
                                {uploading === template.resource ? (
                                  'Đang tải...'
                                ) : (
                                  <>
                                    <UploadIcon className="h-4 w-4 mr-1" />
                                    Tải lên
                                  </>
                                )}
                              </Button>
                            </Label>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt hệ thống</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Các cài đặt hệ thống khác sẽ được thêm vào đây.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
