import { AppSidebar } from '@/components/shared/sidebar/app-sidebar'
import { AppHeader } from '@/components/shared/header/app-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Outlet, useLocation } from 'react-router-dom'

const MainLayout = () => {
  const location = useLocation()
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <AppHeader />
        <Outlet key={location.pathname} />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default MainLayout
