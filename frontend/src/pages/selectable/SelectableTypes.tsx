import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Settings, Plus, Database, Search, Edit, Trash2, X } from 'lucide-react'
import {
  getSelectableTypes,
  getSelectableList,
  createSelectableValue,
  updateSelectableValue,
  deleteSelectableValue,
  type SelectableType,
  type SelectableValue,
  type SelectableListResponse,
} from '@/lib/services/selectable'
import { getSelectableTypeLabel, getLabel } from '@/constants/dictionary'
import { toast } from 'sonner'

const formSchema = z.object({
  name: z.string().min(1, 'Tên là bắt buộc'),
  value: z.string().min(1, 'tạo mục là bắt buộc'),
  dictionary: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const SelectableTypes: React.FC = () => {
  const [types, setTypes] = useState<SelectableType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [values, setValues] = useState<SelectableValue[]>([])
  const [valuesLoading, setValuesLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SelectableValue | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      value: '',
      dictionary: '',
    },
  })

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const data = await getSelectableTypes()
        setTypes(data)
      } catch (error) {
        console.error('Error fetching selectable types:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTypes()
  }, [])

  const fetchValues = async (type: string) => {
    try {
      setValuesLoading(true)
      const response: SelectableListResponse = await getSelectableList(type, {
        pageIndex: 0,
        pageSize: 100,
        search: search || undefined,
      })
      setValues(response.items)
    } catch (error) {
      console.error('Error fetching values:', error)
      toast.error('Không thể tải dữ liệu')
    } finally {
      setValuesLoading(false)
    }
  }

  const handleOpenDialog = async (type: string) => {
    setSelectedType(type)
    setSearch('')
    setIsDialogOpen(true)
    await fetchValues(type)
  }

  const handleSubmit = async (data: FormData) => {
    if (!selectedType) return

    try {
      if (editingItem) {
        await updateSelectableValue(selectedType, editingItem._id, data)
        toast.success('Cập nhật thành công')
      } else {
        await createSelectableValue(selectedType, data)
        toast.success('Tạo mới thành công')
      }
      form.reset()
      setEditingItem(null)
      await fetchValues(selectedType)
    } catch (error) {
      console.error('Error saving value:', error)
      toast.error('Không thể lưu dữ liệu')
    }
  }

  const handleEdit = (item: SelectableValue) => {
    setEditingItem(item)
    form.reset({
      name: item.name || '',
      value: item.value || '',
      dictionary: item.dictionary || '',
    })
  }

  const handleDelete = async (id: string) => {
    if (!selectedType || !confirm('Bạn có chắc chắn muốn xóa tạo mục này?')) return

    try {
      await deleteSelectableValue(selectedType, id)
      toast.success('Xóa thành công')
      await fetchValues(selectedType)
    } catch (error) {
      console.error('Error deleting value:', error)
      toast.error('Không thể xóa dữ liệu')
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    form.reset({
      name: '',
      value: '',
      dictionary: '',
    })
  }

  const handleSearch = async () => {
    if (selectedType) {
      await fetchValues(selectedType)
    }
  }

  // Check if type uses dictionary field
  const usesDictionary = (type: string) => {
    return ['plate_colors', 'return_types'].includes(type)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý dữ liệu tạo mục</h1>
          {/* <p className="text-muted-foreground">
            Quản lý các tạo mục tạo mục động cho các trường trong hệ thống
          </p> */}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            {types.length} Loại
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.map((type) => (
          <Card key={type.type} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{getSelectableTypeLabel(type.type)}</span>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* <div className="text-sm text-muted-foreground">
                  <p>
                    Mã: <code className="bg-muted px-1 rounded">{type.type}</code>
                  </p>
                </div> */}
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => handleOpenDialog(type.type)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Quản lý tạo mục
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {types.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy loại tạo mục</h3>
          <p className="text-muted-foreground">Các tạo mục có thể chỉnh sửa sẽ xuất hiện ở đây.</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Quản lý tạo mục: {selectedType ? getSelectableTypeLabel(selectedType) : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and Add Section */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm tạo mục..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Tìm
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm tạo mục
              </Button>
            </div>

            {/* Values Table */}
            <div className="border rounded-lg">
              {valuesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {selectedType ? getLabel('name', selectedType as any) : 'Tên'}
                      </TableHead>
                      <TableHead>
                        {selectedType ? getLabel('value', selectedType as any) : 'tạo mục'}
                      </TableHead>
                      {selectedType && usesDictionary(selectedType) && (
                        <TableHead>{getLabel('dictionary', selectedType as any)}</TableHead>
                      )}
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {values.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.value}</TableCell>
                        {selectedType && usesDictionary(selectedType) && (
                          <TableCell>
                            {item.dictionary && <Badge variant="outline">{item.dictionary}</Badge>}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {values.length === 0 && !valuesLoading && (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Không tìm thấy tạo mục</h3>
                  <p className="text-muted-foreground">
                    Chưa có tạo mục{' '}
                    {selectedType ? getSelectableTypeLabel(selectedType).toLowerCase() : ''} nào
                    được tạo.
                  </p>
                </div>
              )}
            </div>

            {/* Form Section */}
            {(editingItem || !editingItem) && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">
                  {editingItem ? 'Chỉnh sửa tạo mục' : 'Thêm tạo mục'}
                </h3>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {selectedType ? getLabel('name', selectedType as any) : 'Tên'}
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {selectedType ? getLabel('value', selectedType as any) : 'tạo mục'}
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {selectedType && usesDictionary(selectedType) && (
                      <FormField
                        control={form.control}
                        name="dictionary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {selectedType
                                ? getLabel('dictionary', selectedType as any)
                                : 'Từ điển'}{' '}
                              (Tùy chọn)
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <div className="flex justify-end gap-2">
                      {editingItem && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingItem(null)
                            form.reset()
                          }}
                        >
                          Hủy chỉnh sửa
                        </Button>
                      )}
                      <Button type="submit">{editingItem ? 'Cập nhật' : 'Tạo'}</Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SelectableTypes
