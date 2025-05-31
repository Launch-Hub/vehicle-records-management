import { lazy } from 'react'

import LoginPage from '@/pages/auth/Login'
import HomePage from '@/pages/Home'
import UsersPage from '@/pages/users/Users'
import UserDetailPage from '@/pages/users/UserDetail'
import DashboardPage from '@/pages/Dashboard'
import ForgotPasswordPage from '@/pages/auth/ForgotPassword'
import ForbiddenPage from '@/pages/system/Forbidden'
import NotFoundPage from '@/pages/system/NotFound'

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
}

interface TranslationProps {}

interface RouteProps {
  auth: boolean
  element: string
  resource: string
  path: string
  text?: string
  language?: string
  translations?: Array<TranslationProps>
}

export const ROUTES: Array<RouteProps> = [
  //  public routes
  {
    auth: false,
    element: 'LoginPage',
    resource: 'login',
    path: '/login',
    text: 'Login',
  },
  {
    auth: false,
    element: 'ForgotPasswordPage',
    resource: 'forgotPassword',
    path: '/forgot-password',
    text: 'Forgot Password',
  },
  // error handlers
  {
    auth: false,
    element: 'ForbiddenPage',
    resource: 'forbidden',
    path: '/forbidden',
    text: '403 Forbidden',
  },
  {
    auth: false,
    element: 'NotFoundPage',
    resource: 'notFound',
    path: '/not-found',
    text: '404 Not Found',
    language: 'en',
  },
  // authenticated routes
  {
    auth: true,
    element: 'HomePage',
    resource: 'general',
    path: '/',
    text: '404 Not Found',
    language: 'en',
  },
  {
    auth: true,
    element: 'DashboardPage',
    resource: 'general',
    path: '/dashboard',
    text: 'Dashboard',
    language: 'en',
    translations: [
      {
        path: '/bang-dieu-khien',
        text: 'Bảng điều khiển',
        language: 'vi',
      },
    ],
  },
  {
    auth: true,
    element: 'UsersPage',
    resource: 'users',
    path: '/users',
    text: 'Manage Users',
    language: 'en',
    translations: [
      {
        path: '/quan-ly-nguoi-dung',
        text: 'Quản lý Người Dùng',
        language: 'vi',
      },
    ],
  },
  {
    auth: true,
    element: 'UserDetailPage',
    resource: 'users',
    path: '/users/:userId',
    text: 'User Detail',
    language: 'en',
    translations: [
      {
        language: 'vi',
        path: '/quan-ly-nguoi-dung/:userId',
        text: 'Thông tin người dùng',
      },
    ],
  },
]
