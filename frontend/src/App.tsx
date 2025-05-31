import { Suspense, type Key } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PAGE_MAP, ROUTES, type PageKey } from '@/routes'
import { ProtectedRoute } from '@/components/shared/protected-route'
import { ContextProviders } from '@/contexts/ContextProviders'

import MainLayout from '@/layouts/MainLayout'

export default function App() {
  const layoutRoutes = ROUTES.filter((r) => r.auth)
  const publicRoutes = ROUTES.filter((r) => !r.auth)

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
          {layoutRoutes.map(({ path, element, resource, text }) => {
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
                key={path as Key}
                path={path}
                element={
                  <ProtectedRoute title={text} resource={resource}>
                    {Comp}
                  </ProtectedRoute>
                }
              />
            )
          })}
        </Route>
      </Routes>
    </ContextProviders>
  )
}
