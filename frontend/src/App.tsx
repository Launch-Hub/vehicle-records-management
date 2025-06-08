import { Suspense, useMemo, type ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PAGE_MAP, ROUTES, type CustomRouteProps, type PageKey } from '@/routes'

import MainLayout from '@/layouts/MainLayout'
import { ProtectedRoute } from '@/components/shared/protected-route'
import { Toaster } from './components/ui/sonner'
import { AuthProvider } from './contexts/auth'
import { LoaderProvider } from './contexts/loader'
import { LayoutProvider, useLayout } from './contexts/layout'
import { useTheme } from './contexts/theme/use-theme'

function renderRoute(route: CustomRouteProps, isProtected: boolean = false): ReactNode {
  const { path, element, children, resource, title } = route
  const routeDef = PAGE_MAP[element as PageKey]

  if (!routeDef) return null

  const Component = routeDef.lazy ? (
    <Suspense>
      <routeDef.lazy />
    </Suspense>
  ) : (
    <routeDef.component />
  )

  const WrappedComponent = isProtected ? (
    <ProtectedRoute title={title} resource={resource}>
      {Component}
    </ProtectedRoute>
  ) : (
    Component
  )

  return (
    <Route key={path} path={path} element={WrappedComponent}>
      {children?.map((child) => renderRoute(child, isProtected))}
    </Route>
  )
}

export default function App() {
  const { theme } = useTheme()
  const layoutRoutes = ROUTES.filter((r) => r.auth)
  const publicRoutes = ROUTES.filter((r) => !r.auth)

  const nonProtectedRoutes = useMemo(
    () => publicRoutes.map((route) => renderRoute(route, false)),
    [publicRoutes]
  )
  const protectedRoutes = useMemo(
    () => layoutRoutes.map((route) => renderRoute(route, true)),
    [layoutRoutes]
  )

  return (
    <LoaderProvider>
      <Toaster position="top-right" expand={true} theme={theme} duration={4000} richColors closeButton />
      <LayoutProvider>
        <BrowserRouter basename="/">
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              {nonProtectedRoutes}
              {/* Protected Routes wrapped in MainLayout */}
              <Route element={<MainLayout />}>{protectedRoutes}</Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </LayoutProvider>
    </LoaderProvider>
  )
}
