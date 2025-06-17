import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import api from '@/lib/axios'
import type { User } from '@/lib/types/tables.type'
import UserForm from '@/components/page/users/form'
import { useLoader } from '@/contexts/loader/use-loader'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { backPath } from '@/lib/utils'
import { useLayout } from '@/contexts/layout'

export default function UserDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const loader = useLoader()
  const { setTitle } = useLayout()

  const isCreating = !id || id === 'new'
  const isCopying = location.search.includes('copy=true')
  const defaultAction = isCreating || isCopying ? 'create' : 'update'

  const [initialData, setInitialData] = useState<User | undefined>(undefined)

  useEffect(() => {
    setTitle(
      isCreating ? 'Tạo người dùng mới' : isCopying ? 'Sao chép người dùng' : 'Chỉnh sửa người dùng'
    )
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

  return (
    <div className="flex flex-col p-6 md:px-10">
      <div className="flex justify-between mb-6">
        {/* <h1 className="text-secondary text-xl font-semibold ">
          {defaultAction === 'create'
            ? isCopying
              ? 'Sao chép người dùng'
              : 'Tạo người dùng mới'
            : 'Chỉnh sửa người dùng'}
        </h1> */}

        <Button
          variant="link"
          className="flex items-center text-secondary hover:opacity-50 gap-0 -translate-x-4"
          onClick={() => navigate(backPath(location.pathname))}
        >
          <ChevronLeft width={20} />
          Quay lại
        </Button>
      </div>
      <UserForm
        onSubmit={(data) => handleSubmit(defaultAction, data)}
        initialData={defaultAction === 'update' ? initialData : undefined}
        isCopying={isCopying}
      />
    </div>
  )
}
