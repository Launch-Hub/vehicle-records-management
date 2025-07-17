// 1. Define types for each resource

type UserDictionary = {
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  avatar: string;
  assignedUnit: string;
  serviceNumber: string;
  permissions: string;
  metadata: string;
  status: string;
  createdAt: string;
  isAdmin: string;
  isDeleted: string;
};

type VehicleRecordDictionary = {
  plateNumber: string;
  color: string;
  identificationNumber: string;
  engineNumber: string;
  vehicleType: string;
  registrant: string;
  phone: string;
  email: string;
  address: string;
  archiveAt: string;
  issuerId: string;
  note: string;
  status: string;
  createdAt: string;
};

type ActionTypeDictionary = {
  order: string;
  name: string;
  step: string;
  toStep: string;
};

type ActivityLogDictionary = {
  action: string;
  resource: string;
  documentId: string;
  description: string;
  changes: string;
  userId: string;
  createdAt: string;
};

type ArchiveDictionary = {
  storage: string;
  room: string;
  row: string;
  shelf: string;
  level: string;
};

type BulkDictionary = {
  code: string;
  name: string;
  size: string;
  note: string;
};

type IssuerDictionary = {
  citizenIDNumber: string;
  name: string;
  phone: string;
  address: string;
  note: string;
};

type PermissionDictionary = {
  read: string;
  write: string;
  delete: string;
};

type PlateColorDictionary = {
  code: string;
  name: string;
};

type ProcedureDictionary = {
  record: string;
  bulk: string;
  registrationType: string;
  oldPlate: string;
  steps: string;
  currentStep: string;
  status: string;
  note: string;
  dueDate: string;
  resultReturnType: string;
  completedAt: string;
  archivedAt: string;
  createdAt: string;
};

type RoleDictionary = {
  name: string;
  description: string;
  defaultPermissions: string;
};

// 2. Combine into a master type

type Dictionary = {
  users: UserDictionary;
  vehicle_records: VehicleRecordDictionary;
  action_types: ActionTypeDictionary;
  activity_logs: ActivityLogDictionary;
  archives: ArchiveDictionary;
  bulks: BulkDictionary;
  issuers: IssuerDictionary;
  permissions: PermissionDictionary;
  plate_colors: PlateColorDictionary;
  procedures: ProcedureDictionary;
  roles: RoleDictionary;
};

// 3. Update DICTIONARY with all resources and fields

export const DICTIONARY: Dictionary = {
  users: {
    username: 'Tài khoản',
    email: 'Email',
    passwordHash: 'Mật khẩu',
    name: 'Họ và tên',
    phone: 'Số điện thoại',
    avatar: 'Ảnh đại diện',
    assignedUnit: 'Đơn vị',
    serviceNumber: 'Số hiệu',
    permissions: 'Quyền',
    metadata: 'Thông tin phụ',
    status: 'Trạng thái',
    createdAt: 'Ngày tạo',
    isAdmin: 'Quản trị viên',
    isDeleted: 'Đã xóa',
  },
  vehicle_records: {
    plateNumber: 'Biển số xe',
    color: 'Màu biển số',
    identificationNumber: 'Số khung',
    engineNumber: 'Số máy',
    vehicleType: 'Loại xe',
    registrant: 'Tên chủ xe',
    phone: 'Số điện thoại',
    email: 'Email',
    address: 'Địa chỉ',
    archiveAt: 'Vị trí lưu trữ',
    issuerId: 'Người tiếp nhận',
    note: 'Ghi chú',
    status: 'Trạng thái',
    createdAt: 'Ngày tạo',
  },
  action_types: {
    order: 'Thứ tự',
    name: 'Tên mục',
    step: 'Bước',
    toStep: 'Bước tiếp theo',
  },
  activity_logs: {
    action: 'Hành động',
    resource: 'Tài nguyên',
    documentId: 'ID tài liệu',
    description: 'Mô tả',
    changes: 'Thay đổi',
    userId: 'Người dùng',
    createdAt: 'Ngày tạo',
  },
  archives: {
    storage: 'Kho',
    room: 'Phòng',
    row: 'Dãy',
    shelf: 'Kệ',
    level: 'Tầng',
  },
  bulks: {
    code: 'Mã lô',
    name: 'Tên lô',
    size: 'Kích thước',
    note: 'Ghi chú',
  },
  issuers: {
    citizenIDNumber: 'Số CCCD',
    name: 'Tên người cấp',
    phone: 'Số điện thoại',
    address: 'Địa chỉ',
    note: 'Ghi chú',
  },
  permissions: {
    read: 'Xem',
    write: 'Thêm/Chỉnh sửa',
    delete: 'Xóa',
  },
  plate_colors: {
    code: 'Mã màu',
    name: 'Tên màu',
  },
  procedures: {
    record: 'Hồ sơ',
    bulk: 'Lần nhập',
    registrationType: 'Trạng thái đăng ký',
    oldPlate: 'Biển số cũ',
    steps: 'Các bước',
    currentStep: 'Bước hiện tại',
    status: 'Trạng thái',
    note: 'Ghi chú',
    dueDate: 'Ngày hết hạn',
    resultReturnType: 'Cách trả kết quả',
    completedAt: 'Ngày hoàn thành',
    archivedAt: 'Ngày lưu trữ',
    createdAt: 'Ngày tiếp nhận',
  },
  roles: {
    name: 'Tên vai trò',
    description: 'Mô tả',
    defaultPermissions: 'Quyền mặc định',
  },
};

export function getLabel<R extends keyof Dictionary, K extends keyof Dictionary[R]>(
  key: K,
  resource: R
): string {
  return DICTIONARY[resource][key] ? String(DICTIONARY[resource][key]) : '';
}

export const PERMISSION_DICTIONARY = {
  general: 'Quản lý',
  settings: '',
  reports: 'Báo cáo',
  users: 'Quản lý người dùng',
  records: 'Tìm kiếm xe',
  procedures: 'Quản lý đăng ký',
  bulks: 'Quản lý Lần nhập',
  action_types: 'Quản lý Tạo mục',
  activites: 'Quản lý hoạt động',
  procedures_1: 'Tiếp nhận hồ sơ',
  procedures_2: 'Xử lý hồ sơ',
  procedures_3: 'Thu phí',
  procedures_4: 'Trình ký hồ sơ',
  procedures_5: 'Trả kết quả',
  //
  read: 'Xem',
  write: 'Thêm/Chỉnh sửa',
  delete: 'Xoá',
}

export function getPermissionLabel(key: string): string {
  return PERMISSION_DICTIONARY[key as keyof typeof PERMISSION_DICTIONARY] ?? ''
}

export const RECORD_STATUS_DICTIONARY = {
  idle: 'Nhàn rỗi',
  active: 'Đang xử lý',
  archived: 'Đã lưu trữ',
}
export function getStatusLabel(key: string): string {
  return RECORD_STATUS_DICTIONARY[key as keyof typeof RECORD_STATUS_DICTIONARY] ?? ''
}

export const PROCEDURE_STATUS_DICTIONARY = {
  pending: 'Đăng ký mới',
  processing: 'Đang xử lý',
  overdue: 'Đã quá hạn',
  completed: 'Đã hoàn thành',
  rejected: 'Đã từ chối',
  cancelled: 'Đã huỷ',
  archived: 'Đã lưu trữ',
}
export function getProcedureStatusLabel(key: string): string {
  return PROCEDURE_STATUS_DICTIONARY[key as keyof typeof PROCEDURE_STATUS_DICTIONARY] ?? ''
}
