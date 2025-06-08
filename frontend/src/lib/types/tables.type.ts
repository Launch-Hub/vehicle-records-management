interface PermissionProps {
  read: boolean
  write: boolean
  delete: boolean
}
export type Permission = Record<string, PermissionProps>

interface UserProps {
  _id?: string
  username: string
  email: string
  name?: string
  avatar?: string
  token?: string
  password?: string // for crud
  roles: Array<string>
  permissions: Permission
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

export interface LegalRecordProps {
  _id: string
  licensePlate: string
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
export type LegalRecord = LegalRecordProps
