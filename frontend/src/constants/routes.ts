import { lazy } from 'react'

import LoginPage from '@/pages/auth/Login'
import HomePage from '@/pages/Home'
import UsersPage from '@/pages/users/Users'
import UserDetailPage from '@/pages/users/UserDetail'
import DashboardPage from '@/pages/Dashboard'
import ForgotPasswordPage from '@/pages/auth/ForgotPassword'
import ForbiddenPage from '@/pages/handlers/Forbidden'
import NotFoundPage from '@/pages/handlers/NotFound'

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
    lazy: lazy(() => import('@/pages/handlers/Forbidden')), // lazy-loaded
    component: ForbiddenPage,
    default: 'eager',
  },
  NotFoundPage: {
    lazy: lazy(() => import('@/pages/handlers/NotFound')), // lazy-loaded
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

export const ROUTES = {
  //  public routes
  LOGIN: {
    auth: false,
    element: 'LoginPage',
    path: '/login',
  },
  FORGOT_PASSWORD: {
    auth: false,
    element: 'ForgotPasswordPage',
    path: '/forgot-password',
  },
  // error handlers
  FORBIDDEN: {
    auth: false,
    element: 'ForbiddenPage',
    path: '/forbidden',
  },
  NOT_FOUND: {
    auth: false,
    element: 'NotFoundPage',
    path: '/not-found',
  },
  // authenticated routes
  HOME: {
    auth: true,
    element: 'HomePage',
    path: '/',
  },
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
