import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import api from '@/lib/axios'
import type { User } from '@/lib/types/tables.type'
import UserForm from '@/components/page/users/form'
import { useLoader } from '@/contexts/loader/use-loader'

export default function UserDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const loader = useLoader()

  const isCreating = id === 'new'
  const isCopying = location.search.includes('copy=true')

  const [initialData, setInitialData] = useState<User | undefined>(undefined)

  useEffect(() => {
    if (isCreating) return
    const fetchUser = async () => {
      loader.show()
      try {
        const res = await api.get(`/users/${id}`)
        if (res.data) {
          setInitialData(res.data)
        } else {
          toast.error('Không tìm thấy người dùng.')
          navigate(-1)
        }
      } catch (err) {
        console.error(err)
        toast.error('Lỗi khi tải dữ liệu người dùng.')
        navigate(-1)
      } finally {
        loader.hide()
      }
    }
    fetchUser()
  }, [id])

  const handleSubmit = async (action: 'create' | 'update' | 'copy', data: Omit<User, '_id'>) => {
    loader.show()
    try {
      if (action === 'create') {
        await api.post('/users', data)
        toast.success('Tạo người dùng thành công.')
      } else {
        await api.put(`/users/${id}`, data)
        toast.success('Cập nhật người dùng thành công.')
      }
      navigate(-1)
    } catch (err) {
      console.error(err)
      toast.error('Không thể lưu dữ liệu. Vui lòng thử lại.')
    } finally {
      loader.hide()
    }
  }

  const defaultAction = isCreating || isCopying ? 'create' : 'update'

  return (
    <div className="flex flex-col p-6 md:p-10">
      <div className="text-xl font-semibold mb-6">
        {defaultAction === 'create'
          ? isCopying
            ? 'Sao chép người dùng'
            : 'Tạo người dùng mới'
          : 'Chỉnh sửa người dùng'}
      </div>
      <UserForm
        onSubmit={(data) => handleSubmit(defaultAction, data)}
        initialData={defaultAction === 'update' ? initialData : undefined}
        isCopying={isCopying}
      />
    </div>
  )
}
