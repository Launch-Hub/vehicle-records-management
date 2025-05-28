import { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './contexts/theme/ThemeProvider'

import { PAGE_MAP, ROUTES, type PageKey } from '@/constants/routes'
import MainLayout from '@/layouts/MainLayout'
import { ProtectedRoute } from './contexts/auth/ProtectedRoute'
import { AuthProvider } from './contexts/auth/AuthContext'

function App() {
  const layoutRoutes = Object.values(ROUTES).filter((r) => r.auth)
  const publicRoutes = Object.values(ROUTES).filter((r) => !r.auth)
  return (
    <AuthProvider>
      {/* Adjust the basename as needed */}
      <BrowserRouter basename={'/'}>
        <ThemeProvider storageKey="app-theme">
          <Routes>
            {publicRoutes.map(({ path, element }, i) => {
              const route = PAGE_MAP[element as PageKey]
              const Comp = route.lazy ? (
                <Suspense>
                  <route.lazy />
                </Suspense>
              ) : (
                <route.component />
              )
              return <Route key={i} path={path} element={Comp} />
            })}

            <Route element={<MainLayout />}>
              {layoutRoutes.map(({ path, element }, i) => {
                const route = PAGE_MAP[element as PageKey]
                const Comp = route.lazy ? (
                  <Suspense>
                    <route.lazy />
                  </Suspense>
                ) : (
                  <route.component />
                )
                return (
                  <Route
                    key={i}
                    path={path}
                    element={<ProtectedRoute resource="articles">{Comp}</ProtectedRoute>}
                  />
                )
              })}
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
