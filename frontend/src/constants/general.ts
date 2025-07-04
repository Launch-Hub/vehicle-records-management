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

export const $adminOnlyPerms = ['users']
export const $generalPerms = ['general', 'settings', 'reports']
export const $permissionOrigin = [
  // 'general',
  // 'settings',
  // 'users',
  'records',
  'bulks',
  'action_types',
  'activites',
  'procedures',
  //
  'procedures_1',
  'procedures_2',
  'procedures_3',
  'procedures_4',
  'procedures_5',
]

export const DEFAULT_PERMISSION = [...$permissionOrigin, ...$adminOnlyPerms, ...$generalPerms].map(
  (e) => {
    if ($generalPerms.includes(e) || $adminOnlyPerms.includes(e))
      return {
        key: e,
        label: getPermissionLabel(e),
        canChange: false,
        default: $adminOnlyPerms.includes(e)
          ? {
              read: false,
              write: false,
              delete: false,
            }
          : {
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
  }
)

export const STEP_TABS = [
  { value: 1, label: 'Tiếp nhận', color: 'bg-blue-500' },
  { value: 2, label: 'Phân loại', color: 'bg-green-500' },
  { value: 3, label: 'Thu phí', color: 'bg-yellow-500' },
  { value: 4, label: 'Trình ký', color: 'bg-red-500' },
  { value: 5, label: 'Trả kết quả', color: 'bg-purple-500' },
]
