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
  avatar?: string
  assignedUnit: string
  serviceNumber: string
  //
  token?: string
  permissions: Permission
}
interface UserProps extends Omit<LoginUserProps, 'token'> {
  _id: string
  password?: string // for crud
  status?: string // for crud
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
  issuer: string
  phone?: string
  email?: string
  address?: string
  registryCategory: string
  attachmentUrls: string[]
  archiveLocation: ArchiveLocationProps
  description?: string
  note?: string
  status: string
}
export type VehicleRecord = VehicleRecordProps
