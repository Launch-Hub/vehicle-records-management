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
  createdAt?: Date
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

interface ProcedureStepProps {
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
export type ProcedureStep = ProcedureStepProps

interface ProcedureProps {
  _id: string
  recordId: string
  record?: VehicleRecordProps // for populate
  bulkId?: string
  bulk?: BulkProps // for populate
  registrationType: string
  steps: ProcedureStep[]
  currentStep: number
  oldPlate?: string
  newPlate?: string // for change plate
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  note?: string
  dueDate?: Date
  completedAt?: Date
  archivedAt?: Date
  createdAt: Date
  updatedAt?: Date
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

interface ActionTypeProps {
  _id: string
  order: number
  name: string
  step: number
  toStep: number
  createdAt?: Date
  updatedAt?: Date
}
export type ActionType = ActionTypeProps
