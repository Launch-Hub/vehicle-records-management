import { z } from 'zod'

export const PermissionSchema = z.object({
  read: z.boolean(),
  write: z.boolean(),
  delete: z.boolean(),
  _id: z.string().optional(),
})

export const UserFormSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  name: z.string().min(1, 'Họ và tên là bắt buộc'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  assignedUnit: z.string().min(1, 'Đơn vị là bắt buộc'),
  serviceNumber: z.string().min(1, 'Số hiệu CAND là bắt buộc'),
  password: z.string().optional(),
  avatar: z.string().optional(),
  permissions: z.record(PermissionSchema),
  status: z.string(),
})
export type UserFormValues = z.infer<typeof UserFormSchema>

export const VehicleRecordSchema = z.object({
  plateNumber: z.string().min(1, 'Biển số xe là bắt buộc'),
  color: z.string().min(1, 'Màu sơn là bắt buộc'),
  identificationNumber: z.string().min(1, 'Số khung là bắt buộc'),
  engineNumber: z.string().min(1, 'Số máy là bắt buộc'),
  registrant: z.string().min(1, 'Chủ xe là bắt buộc'),
  phone: z.string().optional(),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  address: z.string().optional(),
  issuer: z.string(),
  note: z.string().optional(),
  status: z.string(),
  archiveAt: z
    .object({
      storage: z.string(),
      room: z.string(),
      row: z.string(),
      shelf: z.string(),
      level: z.string(),
    })
    .optional(),
  registrationType: z.string(),
  attachmentUrls: z.array(z.string()),
  description: z.string().optional(),
})
export type VehicleRecordFormValues = z.infer<typeof VehicleRecordSchema>

export const BulkFormSchema = z.object({
  code: z.string().min(1, 'Mã lô là bắt buộc'),
  name: z.string().min(1, 'Tên lô là bắt buộc'),
  initSize: z.coerce.number().min(0, 'Kích thước ban đầu phải >= 0'),
  currentSize: z.coerce.number().min(0, 'Kích thước hiện tại phải >= 0'),
  note: z.string().optional(),
})
export type BulkFormValues = z.infer<typeof BulkFormSchema>
