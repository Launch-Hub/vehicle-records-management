import { lazy } from 'react'
import { FileStackIcon, FolderIcon, LayoutDashboardIcon, UsersIcon, type LucideIcon } from 'lucide-react'

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
import { DEFAULT_LANG } from './constants/env'

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
  icon?: LucideIcon
  path: string
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
    element: 'HomePage',
    resource: 'general',
    showSidebar: false,
    path: '/',
    title: 'Home',
    language: 'en',
    translations: [
      {
        language: 'vi',
        title: 'Trang chủ',
      },
    ],
  },
  {
    auth: true,
    element: 'DashboardPage',
    resource: 'general',
    showSidebar: true,
    icon: LayoutDashboardIcon,
    path: '/dashboard',
    title: 'Dashboard',
    language: 'en',
    translations: [
      {
        path: '/bang-dieu-khien',
        title: 'Bảng điều khiển',
        language: 'vi',
      },
    ],
  },
  {
    auth: true,
    element: 'UsersPage',
    resource: 'users',
    showSidebar: true,
    icon: UsersIcon,
    path: '/users',
    title: 'Manage Users',
    language: 'en',
    translations: [
      {
        path: '/quan-ly-nguoi-dung',
        title: 'Quản lý Người Dùng',
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
    icon: FolderIcon,
    path: '/records',
    title: 'Manage Records',
    language: 'en',
    translations: [
      {
        path: '/quan-ly-ho-so',
        title: 'Quản lý Hồ Sơ',
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
  
  {
    auth: true,
    element: 'ProcedurePage',
    resource: 'procedures',
    showSidebar: true,
    icon: FileStackIcon,
    path: '/procedures',
    title: 'Manage Procedures',
    language: 'en',
    translations: [
      {
        path: '/quan-ly-thu-tuc',
        title: 'Thủ tục Đăng ký',
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

export const getRoute = (pathname: string): CustomRouteProps | null => {
  return ROUTES.find((route) => pathname.startsWith(route.path)) ?? null
}

export const getRouteField = <K extends keyof CustomRouteProps>(
  returnKey: K,
  pathname: string
): CustomRouteProps[K] | undefined => {
  const path = pathname.replace('/', '')
  const route = ROUTES.find((route) => route.path.includes(path))
  if (!route) return undefined
  return route[returnKey]
}
