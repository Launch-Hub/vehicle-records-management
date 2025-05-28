import { lazy } from 'react'

import LoginPage from '@/pages/auth/Login'
import HomePage from '@/pages/Home'
import UsersPage from '@/pages/users/Users'
import UserDetailPage from '@/pages/users/UserDetail'
import DashboardPage from '@/pages/Dashboard'
import ForgotPasswordPage from '@/pages/auth/ForgotPassword'

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
  HomePage: {
    lazy: lazy(() => import('@/pages/Home')), // lazy-loaded
    component: HomePage,
    default: 'eager',
  },
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
  DashboardPage: {
    lazy: lazy(() => import('@/pages/Dashboard')), // lazy-loaded
    component: DashboardPage,
    default: 'eager',
  },
  // UsersPage: lazy(() => import('@/pages/users/Users')), // lazy-loaded
  // UserDetailPage: lazy(() => import('@/pages/users/UserDetail')), // lazy-loaded
  // DashboardPage: lazy(() => import('@/pages/Dashboard')), // lazy-loaded
}

export const ROUTES = {
  //  public routes
  HOME: {
    path: '/',
    element: 'HomePage',
    auth: false,
  },
  LOGIN: {
    path: '/login',
    element: 'LoginPage',
    auth: false,
  },
  FORGOT_PASSWORD: {
    path: '/forgot-password',
    element: 'ForgotPasswordPage',
    auth: false,
  },
  // authenticated routes
  DASHBOARD: {
    auth: true,
    element: 'DashboardPage',
    language: 'en',
    path: '/dashboard',
    text: 'Dashboard',
    translation: [
      {
        path: '/bang-dieu-khien',
        text: 'Bảng điều khiển',
        language: 'vi',
      },
    ],
  },
  USERS: {
    auth: true,
    element: 'UsersPage',
    path: '/users',
    text: 'Manage Users',
    language: 'en',
    translation: [
      {
        path: '/quan',
        text: 'Bảng điều khiển',
        language: 'vi',
      },
    ],
  },
  USER_DETAIL: {
    auth: true,
    element: 'DashboardPage',
    path: '/dashboard',
    text: 'Dashboard',
    language: 'en',
    translation: [
      {
        language: 'vi',
        path: '/dashboard',
        text: 'Bảng điều khiển',
      },
    ],
  },
}
