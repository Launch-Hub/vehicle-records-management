export interface Permission {
  read: boolean
  write: boolean
  delete: boolean
}

export interface User {
  username: string
  email: string
  token: string
  role: Array<string>
  permissions: Record<string, Permission>
}
