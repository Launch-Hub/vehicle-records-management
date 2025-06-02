import { lazy } from 'react'

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

interface TranslationProps {
  path: string
  title: string
  language: string
}

interface RouteProps {
  auth: boolean
  element: string
  resource: string
  showSidebar?: boolean
  path: string
  title?: string
  language?: string
  translations?: Array<TranslationProps>
  children?: Array<RouteProps>
}

export const ROUTES: Array<RouteProps> = [
  //  public routes
  {
    auth: false,
    element: 'LoginPage',
    resource: 'login',
    path: '/login',
    title: 'Login',
  },
  {
    auth: false,
    element: 'ForgotPasswordPage',
    resource: 'forgotPassword',
    path: '/forgot-password',
    title: 'Forgot Password',
  },
  // error handlers
  {
    auth: false,
    element: 'ForbiddenPage',
    resource: 'forbidden',
    path: '/forbidden',
    title: '403 Forbidden',
  },
  {
    auth: false,
    element: 'NotFoundPage',
    resource: 'notFound',
    path: '/not-found',
    title: '404 Not Found',
    language: 'en',
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
  },
  {
    auth: true,
    element: 'DashboardPage',
    resource: 'general',
    showSidebar: true,
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
        auth: true,
        element: 'UserDetailPage',
        resource: 'users',
        path: '/:userId',
        title: 'User Detail',
        language: 'en',
        translations: [
          {
            language: 'vi',
            path: '/:userId',
            title: 'Thông tin người dùng',
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
        auth: true,
        element: 'RecordDetailPage',
        resource: 'records',
        path: '/:recordId',
        title: 'Record Detail',
        language: 'en',
        translations: [
          {
            language: 'vi',
            path: '/:recordId',
            title: 'Chi tiết hồ sơ',
          },
        ],
      },
    ],
  },
]
