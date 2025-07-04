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
  plateNumber: z
    .string()
    .min(7, 'Biển số xe tối thiểu là 7 ký tự')
    .max(9, 'Biển số xe không được vượt quá 9 ký tự'),
  color: z.string(),
  identificationNumber: z.string(),
  engineNumber: z.string(),
  registrant: z.string().min(1, 'Tên chủ xe là bắt buộc'),
  phone: z.string().optional(),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  address: z.string().optional(),
  vehicleType: z.string().optional(),
  issuerId: z.string().optional(),
  note: z.string().optional(),
  status: z.string(),
  archiveAt: z
    .object({
      storage: z.string().min(1, 'Kho là bắt buộc'),
      room: z.string().min(1, 'Phòng là bắt buộc'),
      row: z.string().min(1, 'Dãy là bắt buộc'),
      shelf: z.string().min(1, 'Kệ là bắt buộc'),
      level: z.string().min(1, 'Tầng là bắt buộc'),
    })
    .optional(),
})
export type VehicleRecordFormValues = z.infer<typeof VehicleRecordSchema>

export const BulkFormSchema = z.object({
  code: z.string().min(1, 'Mã Lần nhập là bắt buộc'),
  name: z.string().min(1, 'Tên Lần nhập là bắt buộc'),
  size: z.coerce.number().min(0, 'Số lượng phải >= 0'),
  note: z.string().optional(),
})
export type BulkFormValues = z.infer<typeof BulkFormSchema>

export const ProcedureFormSchema = z.object({
  recordId: z.string(),
  bulkId: z.string().optional(),
  plateNumber: z.string().optional(),
  color: z.string().optional(),
  identificationNumber: z.string().optional(),
  registrationType: z.string().min(1, 'Hạng mục đăng ký là bắt buộc'),
  note: z.string().optional(),
  dueDate: z.date(),
  status: z.string(),
  steps: z.array(z.object({
    order: z.coerce.number(),
    step: z.coerce.number(),
    title: z.string(),
    action: z.string(),
    note: z.string().optional(),
  })),
})
export type ProcedureFormValues = z.infer<typeof ProcedureFormSchema>

export const ActionTypeFormSchema = z.object({
  name: z.string().min(1, 'Hạng mục là bắt buộc'),
  step: z.coerce.number().min(1, 'Bước phải lớn hơn 0'),
  toStep: z.coerce.number().min(1, 'Bước phải lớn hơn 0'),
  order: z.coerce.number(),
})
export type ActionTypeFormValues = z.infer<typeof ActionTypeFormSchema>
