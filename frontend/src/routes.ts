import { lazy } from 'react'
import {
  FileStackIcon,
  LayoutDashboardIcon,
  UsersIcon,
  type LucideIcon,
  HistoryIcon,
  ListTodoIcon,
  HandCoinsIcon,
  FileClockIcon,
  NotebookPenIcon,
  BookOpenCheckIcon,
  ImportIcon,
  PackageOpenIcon,
  PackageIcon,
  HardDriveIcon,
  PrinterCheckIcon,
} from 'lucide-react'

import LoginPage from '@/pages/auth/Login'
import HomePage from '@/pages/Home'
import UsersPage from '@/pages/users/Users'
import UserDetailPage from '@/pages/users/UserDetail'
import DashboardPage from '@/pages/Dashboard'
import ForgotPasswordPage from '@/pages/auth/ForgotPassword'
import ForbiddenPage from '@/pages/system/Forbidden'
import NotFoundPage from '@/pages/system/NotFound'
import RecordsPage from './pages/records/Records'
import RecordDetailPage from './pages/records/RecordDetail'
import ProceduresPage from '@/pages/procedures/Procedures'
import ProcedureDetailPage from '@/pages/procedures/ProcedureDetail'
import BulksPage from '@/pages/bulks/Bulks'
import BulkDetailPage from '@/pages/bulks/BulkDetail'
import ActionTypesPage from '@/pages/action-types/ActionTypes'
import ActionTypeDetailPage from '@/pages/action-types/ActionTypeDetail'
import LogsPage from '@/pages/activities/Logs'
import { DEFAULT_LANG } from './constants/env'
import CreateProcedurePage from '@/pages/procedures/CreateProcedure'

export type PageComponent =
  | React.ComponentType<any>
  | {
      lazy: () => Promise<{ default: React.ComponentType<any> }>
      component: React.ComponentType<any>
      default: LoadingType
    }

export type LoadingType = 'lazy' | 'eager'

export type PageKey = keyof typeof PAGE_MAP

export const PAGE_MAP = {
  LoginPage: {
    lazy: lazy(() => import('@/pages/auth/Login')), // lazy-loaded
    component: LoginPage,
    default: 'eager',
  },
  ForgotPasswordPage: {
    lazy: lazy(() => import('@/pages/auth/ForgotPassword')), // lazy-loaded
    component: ForgotPasswordPage,
    default: 'eager',
  },
  //
  ForbiddenPage: {
    lazy: lazy(() => import('@/pages/system/Forbidden')), // lazy-loaded
    component: ForbiddenPage,
    default: 'eager',
  },
  NotFoundPage: {
    lazy: lazy(() => import('@/pages/system/NotFound')), // lazy-loaded
    component: NotFoundPage,
    default: 'eager',
  },
  //
  HomePage: {
    lazy: lazy(() => import('@/pages/Home')), // lazy-loaded
    component: HomePage,
    default: 'eager',
  },
  DashboardPage: {
    lazy: lazy(() => import('@/pages/Dashboard')), // lazy-loaded
    component: DashboardPage,
    default: 'eager',
  },
  UsersPage: {
    lazy: lazy(() => import('@/pages/users/Users')), // lazy-loaded
    component: UsersPage,
    default: 'eager',
  },
  UserDetailPage: {
    lazy: lazy(() => import('@/pages/users/UserDetail')), // lazy-loaded
    component: UserDetailPage,
    default: 'eager',
  },
  RecordsPage: {
    lazy: lazy(() => import('@/pages/records/Records')), // lazy-loaded
    component: RecordsPage,
    default: 'eager',
  },
  RecordDetailPage: {
    lazy: lazy(() => import('@/pages/records/RecordDetail')), // lazy-loaded
    component: RecordDetailPage,
    default: 'eager',
  },
  ProceduresPage: {
    lazy: lazy(() => import('@/pages/procedures/Procedures')), // lazy-loaded
    component: ProceduresPage,
    default: 'eager',
  },
  CreateProcedurePage: {
    lazy: lazy(() => import('@/pages/procedures/CreateProcedure')), // lazy-loaded
    component: CreateProcedurePage,
    default: 'eager',
  },
  ProcedureDetailPage: {
    lazy: lazy(() => import('@/pages/procedures/ProcedureDetail')), // lazy-loaded
    component: ProcedureDetailPage,
    default: 'eager',
  },
  BulksPage: {
    lazy: lazy(() => import('@/pages/bulks/Bulks')), // lazy-loaded
    component: BulksPage,
    default: 'eager',
  },
  BulkDetailPage: {
    lazy: lazy(() => import('@/pages/bulks/BulkDetail')), // lazy-loaded
    component: BulkDetailPage,
    default: 'eager',
  },
  ActionTypesPage: {
    lazy: lazy(() => import('@/pages/action-types/ActionTypes')), // lazy-loaded
    component: ActionTypesPage,
    default: 'eager',
  },
  ActionTypeDetailPage: {
    lazy: lazy(() => import('@/pages/action-types/ActionTypeDetail')), // lazy-loaded
    component: ActionTypeDetailPage,
    default: 'eager',
  },
  LogsPage: {
    lazy: lazy(() => import('@/pages/activities/Logs')), // lazy-loaded
    component: LogsPage,
    default: 'eager',
  },
}

interface RouteTranslationProps {
  path?: string
  title: string
  language: string
}

export interface CustomRouteProps {
  auth?: boolean
  resource?: string
  element: string
  showSidebar?: boolean
  nav?: number // 1 for primary, 2 for secondary, etc.
  icon?: LucideIcon
  path: string
  query?: Record<string, string | number | boolean>
  enPath?: string // the original path for checking data
  title: string
  language: string
  translations: Array<RouteTranslationProps>
  children?: Array<CustomRouteProps>
}

const GLOBAL_ROUTES: Array<CustomRouteProps> = [
  //  public routes
  {
    auth: false,
    element: 'LoginPage',
    resource: 'login',
    path: '/login',
    title: 'Login',
    language: 'en',
    translations: [
      {
        language: 'vi',
        path: '/dang-nhap',
        title: 'Đăng nhập',
      },
    ],
  },
  {
    auth: false,
    element: 'ForgotPasswordPage',
    resource: 'forgotPassword',
    path: '/forgot-password',
    title: 'Forgot Password',
    language: 'en',
    translations: [
      {
        language: 'vi',
        path: '/quen-mat-khau',
        title: 'Quên mật khẩu',
      },
    ],
  },
  // error handlers
  {
    auth: false,
    element: 'ForbiddenPage',
    resource: 'forbidden',
    path: '/403',
    title: '403 Forbidden',
    language: 'en',
    translations: [
      {
        language: 'vi',
        title: '403 Không có quyền truy cập',
      },
    ],
  },
  {
    auth: false,
    element: 'NotFoundPage',
    resource: 'notFound',
    path: '/404',
    title: '404 Not Found',
    language: 'en',
    translations: [
      {
        language: 'vi',
        title: '404 Không tìm thấy trang',
      },
    ],
  },
  // authenticated routes
  {
    auth: true,
    element: 'DashboardPage',
    resource: 'general',
    showSidebar: true,
    nav: 1,
    icon: LayoutDashboardIcon,
    path: '/',
    title: 'Dashboard',
    language: 'en',
    translations: [
      {
        path: '/',
        title: 'Trang chủ',
        language: 'vi',
      },
    ],
  },
  {
    auth: true,
    element: 'UsersPage',
    resource: 'users',
    showSidebar: true,
    nav: 1,
    icon: UsersIcon,
    path: '/users',
    title: 'Manage Users',
    language: 'en',
    translations: [
      {
        path: '/quan-ly-nguoi-dung',
        title: 'Quản lý người dùng',
        language: 'vi',
      },
    ],
    children: [
      {
        element: 'UserDetailPage',
        path: ':id',
        title: 'Create User',
        language: 'en',
        translations: [
          {
            language: 'vi',
            title: 'Chỉnh sửa người dùng',
          },
        ],
      },
      {
        element: 'UserDetailPage',
        path: 'new',
        title: 'Create User',
        language: 'en',
        translations: [
          {
            language: 'vi',
            title: 'Tạo người dùng mới',
          },
        ],
      },
    ],
  },
  {
    auth: true,
    element: 'RecordsPage',
    resource: 'records',
    showSidebar: true,
    nav: 1,
    icon: HistoryIcon,
    path: '/registration-history',
    title: 'Registration History',
    language: 'en',
    translations: [
      {
        path: '/tim-kiem-xe',
        title: 'Tìm kiếm xe',
        language: 'vi',
      },
    ],
    children: [
      {
        element: 'RecordDetailPage',
        path: ':id',
        title: 'Record Detail',
        language: 'en',
        translations: [
          {
            language: 'vi',
            title: 'Chỉnh sửa hồ sơ',
          },
        ],
      },
      {
        element: 'RecordDetailPage',
        path: 'new',
        title: 'Create Record',
        language: 'en',
        translations: [
          {
            language: 'vi',
            title: 'Tạo hồ sơ mới',
          },
        ],
      },
    ],
  },

  // {
  //   auth: true,
  //   element: 'BulksPage',
  //   resource: 'bulks',
  //   showSidebar: true,
  //   nav: 1,
  //   icon: PackageIcon,
  //   path: '/bulks',
  //   title: 'Manage Bulks',
  //   language: 'en',
  //   translations: [
  //     {
  //       path: '/quan-ly-lo',
  //       title: 'Quản lý Lần nhập Đăng Ký',
  //       language: 'vi',
  //     },
  //   ],
  //   children: [
  //     {
  //       element: 'BulkDetailPage',
  //       path: ':id',
  //       title: 'Bulk Detail',
  //       language: 'en',
  //       translations: [
  //         {
  //           language: 'vi',
  //           title: 'Chỉnh sửa Lần nhập',
  //         },
  //       ],
  //     },
  //     {
  //       element: 'BulkDetailPage',
  //       path: 'new',
  //       title: 'Create Bulk',
  //       language: 'en',
  //       translations: [
  //         {
  //           language: 'vi',
  //           title: 'Tạo Lần nhập mới',
  //         },
  //       ],
  //     },
  //   ],
  // },

  {
    auth: true,
    element: 'ActionTypesPage',
    resource: 'action_types',
    showSidebar: true,
    nav: 1,
    icon: ListTodoIcon,
    path: '/action-types',
    title: 'Manage Action Types',
    language: 'en',
    translations: [
      {
        path: '/quan-ly-hoat-dong',
        title: 'Tạo mục đăng ký',
        language: 'vi',
      },
    ],
    children: [
      {
        element: 'ActionTypeDetailPage',
        path: ':id',
        title: 'Action Type Detail',
        language: 'en',
        translations: [
          {
            language: 'vi',
            title: 'Chỉnh sửa hạng mục',
          },
        ],
      },
      {
        element: 'ActionTypeDetailPage',
        path: 'new',
        title: 'Create Action Type',
        language: 'en',
        translations: [
          {
            language: 'vi',
            title: 'Tạo hạng mục mới',
          },
        ],
      },
    ],
  },

  {
    auth: true,
    element: 'CreateProcedurePage',
    resource: 'procedures_1',
    showSidebar: true,
    nav: 2,
    icon: FileStackIcon,
    path: '/receive-registration',
    title: 'Receive Registration',
    query: { step: 1 },
    language: 'en',
    translations: [
      {
        path: '/tiep-nhan-ho-so',
        title: 'Tiếp nhận hồ sơ',
        language: 'vi',
      },
    ],
    // No children: go directly to create page
  },

  {
    auth: true,
    element: 'ProceduresPage',
    resource: 'procedures_2',
    showSidebar: true,
    nav: 2,
    icon: FileClockIcon,
    path: '/registration-processing',
    title: 'Registration Processing',
    query: { step: 2 },
    language: 'en',
    translations: [
      {
        path: '/xu-li-ho-so',
        title: 'Xử lí hồ sơ',
        language: 'vi',
      },
    ],
    children: [],
  },
  {
    auth: true,
    element: 'ProceduresPage',
    resource: 'procedures_3',
    showSidebar: true,
    nav: 2,
    icon: HandCoinsIcon,
    path: '/payment-process',
    title: 'Payment Process',
    query: { step: 3 },
    language: 'en',
    translations: [
      {
        path: '/thu-phi',
        title: 'Thu phí',
        language: 'vi',
      },
    ],
    children: [],
  },
  {
    auth: true,
    element: 'ProceduresPage',
    resource: 'procedures_4',
    showSidebar: true,
    nav: 2,
    icon: PrinterCheckIcon,
    path: '/-',
    title: '-',
    query: { step: 4 },
    language: 'en',
    translations: [
      {
        path: '/in-the',
        title: 'In thẻ',
        language: 'vi',
      },
    ],
    children: [],
  },
  {
    auth: true,
    element: 'ProceduresPage',
    resource: 'procedures_5',
    showSidebar: true,
    nav: 2,
    icon: NotebookPenIcon,
    path: '/request-approval',
    title: 'Request Approval',
    query: { step: 5 },
    language: 'en',
    translations: [
      {
        path: '/trinh-ki-ho-so',
        title: 'Trình kí hồ sơ',
        language: 'vi',
      },
    ],
    children: [],
  },
  {
    auth: true,
    element: 'ProceduresPage',
    resource: 'procedures_6',
    showSidebar: true,
    nav: 2,
    icon: BookOpenCheckIcon,
    path: '/-',
    title: '-',
    query: { step: 6 },
    language: 'en',
    translations: [
      {
        path: '/ket-qua-ra-quay',
        title: 'Kết quả ra quầy',
        language: 'vi',
      },
    ],
    children: [],
  },
  {
    auth: true,
    element: 'ProceduresPage',
    resource: 'procedures_7',
    showSidebar: true,
    nav: 2,
    icon: HardDriveIcon,
    path: '/result-return',
    title: 'Result Return',
    query: { step: 7 },
    language: 'en',
    translations: [
      {
        path: '/tra-ket-qua',
        title: 'Trả kết quả',
        language: 'vi',
      },
    ],
    children: [],
  },
  {
    auth: true,
    element: 'ProceduresPage',
    resource: 'procedures_8',
    showSidebar: true,
    nav: 2,
    icon: PackageIcon,
    path: '/archive',
    title: 'Archive',
    query: { step: 8 },
    language: 'en',
    translations: [
      {
        path: '/luu-kho',
        title: 'Lưu kho',
        language: 'vi',
      },
    ],
    children: [],
  },
  {
    auth: true,
    element: 'ProceduresPage',
    resource: 'procedures_9',
    showSidebar: true,
    nav: 2,
    icon: PackageOpenIcon,
    path: '/export',
    title: 'Export',
    query: { step: 0 },
    language: 'en',
    translations: [
      {
        path: '/xuat-kho',
        title: 'Xuất kho',
        language: 'vi',
      },
    ],
    children: [],
  },

  {
    auth: true,
    element: 'LogsPage',
    resource: 'activities',
    showSidebar: true,
    nav: 1,
    icon: HistoryIcon,
    path: '/logs',
    title: 'Activity Logs',
    language: 'en',
    translations: [
      {
        path: '/nhat-ky-hoat-dong',
        title: 'Nhật ký hoạt động',
        language: 'vi',
      },
    ],
  },
]

export const ROUTES = GLOBAL_ROUTES.map((e) => {
  const trans = e.translations?.find((t) => t.language === DEFAULT_LANG)
  const base = trans ? { enPath: e.path, ...e, ...trans } : e
  return {
    ...base,
    children: base.children?.map((child) => {
      const childTrans = child.translations?.find((t) => t.language === DEFAULT_LANG)
      const finalChild = childTrans ? { ...child, ...childTrans } : child
      return {
        ...finalChild,
        path: finalChild.path?.replace(/^\//, ''), // remove leading slash for relative path
      }
    }),
    path: base.path, // Keep top-level paths absolute
  }
})

export const getRoute = (
  pathname: string,
  queryParams: Record<string, string | number | boolean> = {}
): CustomRouteProps | undefined => {
  if (pathname === '/') return ROUTES.find((route) => route.path === '/')

  const path = pathname.replace('/', '')
  const route = ROUTES.find((route) => route.path.includes(path))
  if (!route) return undefined
  return route
}

export const getRouteField = <K extends keyof CustomRouteProps>(
  returnKey: K,
  pathname: string
): CustomRouteProps[K] | undefined => {
  if (pathname === '/') return ROUTES.find((route) => route.path === '/')?.[returnKey]

  const path = pathname.replace('/', '')
  const route = ROUTES.find((route) => route.path.includes(path))
  if (!route) return undefined
  return route[returnKey]
}
