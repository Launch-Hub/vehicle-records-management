interface PermissionProps {
  read: boolean
  write: boolean
  delete: boolean
}
export type Permission = Record<string, PermissionProps>

interface LoginUserProps {
  username: string
  email: string
  name?: string
  phone?: string
  avatar?: string
  assignedUnit: string
  serviceNumber: string
  roles?: string[]
  token?: string
  permissions: Permission
  isAdmin?: boolean
}
interface UserProps extends Omit<LoginUserProps, 'token'> {
  _id: string
  password?: string // for crud
  status: string // for crud
}
export type User = UserProps

//

interface ArchiveLocationProps {
  storage: string // Kho
  room: string // Phòng
  row: string // Dãy
  shelf: string // Kệ
  level: string // Tầng
}
export type ArchiveLocation = ArchiveLocationProps

export interface VehicleRecordProps {
  _id: string
  plateNumber: string
  color: string
  identificationNumber: string
  engineNumber: string
  registrant: string
  vehicleType?: string
  phone?: string
  email?: string
  address?: string
  archiveAt?: ArchiveLocationProps
  issuerId?: string
  description?: string
  note?: string
  status: string
  createdAt?: Date
  updatedAt?: Date
}
export type VehicleRecord = VehicleRecordProps

export interface ProcedureStepProps {
  _id?: string
  order: number
  step: number
  title: string
  action: string // ActionType ID
  note?: string
  attachments: string[]
  isCompleted: boolean
  completedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface ProcedureProps {
  _id: string
  recordId: string | VehicleRecordProps
  bulkId?: string | BulkProps
  registrationType: string
  steps: ProcedureStepProps[]
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled' | 'archived'
  note?: string
  dueDate?: Date
  completedAt?: Date
  archivedAt?: Date
  createdAt?: Date
  updatedAt?: Date
  // for store in the client only
  _tempRecord?: VehicleRecordProps
}

export type Procedure = ProcedureProps

export interface BulkProps {
  _id: string
  code: string
  name: string
  size: number
  note?: string
  createdAt?: Date
  updatedAt?: Date
}

export type Bulk = BulkProps
