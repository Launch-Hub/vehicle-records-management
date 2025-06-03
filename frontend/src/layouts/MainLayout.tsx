import { AppSidebar } from '@/components/shared/sidebar/app-sidebar'
import { AppHeader } from '@/components/shared/header/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Outlet, useLocation } from 'react-router-dom'
import { useLayoutEffect } from 'react'
import { useLayout } from '@/contexts/layout'
import { ROUTES } from '@/routes'

const MainLayout = () => {
  const { pathname } = useLocation()
  const { setTitle } = useLayout()

  useLayoutEffect(() => {
    console.count('Path is changed')
    console.log("path: ", pathname)
    // const title = ROUTES
    setTitle('')
  }, [pathname])

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <AppHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default MainLayout
