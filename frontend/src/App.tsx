import { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PAGE_MAP, ROUTES, type PageKey } from '@/constants/routes'
import { ProtectedRoute } from './contexts/auth/protected-route'
import { ContextProviders } from './contexts/ContextProviders'

import MainLayout from '@/layouts/MainLayout'

export default function App() {
  const layoutRoutes = Object.values(ROUTES).filter((r) => r.auth)
  const publicRoutes = Object.values(ROUTES).filter((r) => !r.auth)
  
  return (
    <ContextProviders>
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
                element={<ProtectedRoute resource={element}>{Comp}</ProtectedRoute>}
              />
            )
          })}
        </Route>
      </Routes>
    </ContextProviders>
  )
}
