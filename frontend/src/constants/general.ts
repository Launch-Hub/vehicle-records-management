import { getPermissionLabel } from './dictionary'

export const PLATE_COLORS = [
  {
    label: 'Nền màu trắng, chữ và số màu đen',
    color: '#ffffff',
  },
  {
    label: 'Nền màu vàng, chữ và số màu đen',
    color: '#fec917',
  },
]
export const USER_STATUSES = [
  {
    label: 'Hoạt động',
    value: 'active',
  },
  {
    label: 'Tạm ngưng',
    value: 'inactive',
  },
]
const PermissionOrigin = [
  'general',
  'settings',
  'users',
  'records',
  'procedures',
  'bulks',
  'action_types',
  'activites',
]
export const $generalPerms = ['general', 'settings', 'reports']
export const PERMISSIONS = PermissionOrigin.map((e) => {
  if ($generalPerms.includes(e))
    return {
      key: e,
      label: getPermissionLabel(e),
      canChange: false,
      default: {
        read: true,
        write: true,
        delete: true,
      },
    }
  return {
    key: e,
    label: getPermissionLabel(e),
    canChange: true,
    default: {
      read: true,
      write: true,
      delete: true,
    },
  }
})

export const ROLES = [
  // {
  //   name: 'admin',
  //   permissions: {
  //     general: {
  //       read: true,
  //       write: true,
  //       delete: true,
  //     },
  //     users: {
  //       read: true,
  //       write: true,
  //       delete: true,
  //     },
  //     settings: {
  //       read: true,
  //       write: true,
  //       delete: true,
  //     },
  //     records: {
  //       read: true,
  //       write: true,
  //       delete: true,
  //     },
  //     procedures: {
  //       read: true,
  //       write: true,
  //       delete: true,
  //     },
  //     reports: {
  //       read: true,
  //       write: true,
  //       delete: true,
  //     },
  //   },
  // },
  {
    name: 'default',
    permissions: {
      general: {
        read: true,
        write: true,
        delete: true,
      },
      users: {
        read: false,
        write: false,
        delete: false,
      },
      settings: {
        read: true,
        write: true,
        delete: true,
      },
      records: {
        read: true,
        write: true,
        delete: true,
      },
      procedures: {
        read: true,
        write: true,
        delete: true,
      },
      reports: {
        read: true,
        write: true,
        delete: true,
      },
    },
  },
]

export const STEP_TABS = [
  { value: 1, label: 'Tiếp nhận', color: 'bg-blue-500' },
  { value: 2, label: 'Phân loại', color: 'bg-green-500' },
  { value: 3, label: 'Thu phí', color: 'bg-yellow-500' },
  { value: 4, label: 'Trình ký', color: 'bg-red-500' },
  { value: 5, label: 'Trả kết quả', color: 'bg-purple-500' },
]
