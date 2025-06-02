import { AppSidebar } from '@/components/shared/sidebar/app-sidebar'
import { AppHeader } from '@/components/shared/header/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Outlet } from 'react-router-dom'
import { useLayout } from '@/contexts/layout'

const MainLayout = () => {
  const { title } = useLayout()

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <AppHeader title={title} />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default MainLayout
