type TableDictionary = typeof TABLE_DICTIONARY

export function getLabel(key: string): string {
  return TABLE_DICTIONARY[key as keyof TableDictionary] ?? ''
}

export const TABLE_DICTIONARY = {
  // User
  avatar: '',
  name: 'Họ và tên',
  username: 'Tài khoản',
  email: 'Email',
  roles: 'Vai trò',
  status: 'Trạng thái',
  password: 'Mật khẩu',
  // Legal Record
  licensePlate: 'Biển số xe',
  issuer: 'Người đăng ký',
  phone: 'Số điện thoại',
  address: 'Địa chỉ',
  registryCategory: 'Loại đăng ký',
  attachmentUrls: 'Tài liệu đính kèm',
  archiveLocation: 'Vị trí lưu trữ',
  description: 'Mô tả',
  note: 'Ghi chú',
} as const

export const DICTIONARY = {
  ...TABLE_DICTIONARY,
  // User
  avatar: 'Ảnh đại diện',
}
