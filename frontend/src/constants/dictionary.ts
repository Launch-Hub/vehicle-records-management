type TableDictionary = typeof TABLE_DICTIONARY
type FullDictionary = typeof DICTIONARY
type PermissionDictionary = typeof PERMISSION_DICTIONARY

export const TABLE_DICTIONARY = {
  // User
  avatar: '',
  name: 'Họ và tên',
  username: 'Tài khoản',
  email: 'Email',
  assignedUnit: 'Đơn vị',
  serviceNumber: 'Số hiệu',
  roles: 'Vai trò',
  status: 'Trạng thái',
  password: 'Mật khẩu',
  // Vehicle Record
  plateNumber: 'Biển số xe',
  color: 'Màu',
  identificationNumber: 'Số khung',
  engineNumber: 'Số máy',
  registrant: 'Người đăng ký',
  phone: 'Số điện thoại',
  address: 'Địa chỉ',
  issuer: 'Người tiếp nhận',
  registrationType: 'Loại đăng ký',
  attachmentUrls: 'Tài liệu đính kèm',
  archiveAt: 'Vị trí lưu trữ',
  description: 'Mô tả',
  note: 'Ghi chú',
}
export function getTableLabel(key: string): string {
  return TABLE_DICTIONARY[key as keyof TableDictionary] ?? ''
}

export const PERMISSION_DICTIONARY = {
  general: 'Quản lý',
  settings: '',
  reports: 'Báo cáo',
  users: 'Quản lý người dùng',
  records: 'Quản lý Tạo mục',
  procedures: 'Quản lý đăng ký',
  bulks: 'Quản lý Lô đăng ký',
  action_types: 'Quản lý Tạo mục',
  activites: 'Quản lý hoạt động',
  //
  read: 'Xem',
  write: 'Thêm/Chỉnh sửa',
  delete: 'Xoá',
}

export function getPermissionLabel(key: string): string {
  return PERMISSION_DICTIONARY[key as keyof PermissionDictionary] ?? ''
}

export const DICTIONARY = {
  ...TABLE_DICTIONARY,
  // User
  avatar: 'Ảnh đại diện',
}
export function getLabel(key: string): string {
  return DICTIONARY[key as keyof FullDictionary] ?? ''
}
