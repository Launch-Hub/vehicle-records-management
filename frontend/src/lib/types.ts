export interface Permission {
  _id: String
  read: boolean
  write: boolean
  delete: boolean
}

export interface User {
  _id: String
  username: string
  email: string
  avatar?: string
  token: string
  roles: Array<string>
  permissions: Record<string, Permission>
}

export interface LegalRecord {
  _id: String
  licensePlate: String
  issuer: String
  registryCategory: String
  description: String
  note: String
}
