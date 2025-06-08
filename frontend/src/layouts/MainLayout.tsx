import { AppSidebar } from '@/components/shared/sidebar/app-sidebar'
import { AppHeader } from '@/components/shared/header/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
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
