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
  issuer: string
  phone?: string
  email?: string
  address?: string
  registerType: string
  attachmentUrls: string[]
  archiveAt?: ArchiveLocationProps
  description?: string
  note?: string
  status: string
}
export type VehicleRecord = VehicleRecordProps
