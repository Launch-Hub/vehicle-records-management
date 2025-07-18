import { type ComponentProps } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { ROUTES } from '@/routes'
import { scrollToTop } from '@/lib/utils'
import { NavMain } from '@/components/shared/sidebar/nav-main'
import { NavUser } from '@/components/shared/sidebar/nav-user'
import { NavSecondary } from '@/components/shared/sidebar/nav-secondary'
import { useAuth } from '@/contexts/auth/use-auth'

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const navMain = ROUTES.filter((e) => {
    if (e.isAdmin) return user?.isAdmin && e.showSidebar && (e.nav ?? 1) === 1
    return e.showSidebar && (e.nav ?? 1) === 1
  }).map((e) => mapRoute(e))
  const navSecondary = ROUTES.filter((e) => e.showSidebar && e.nav === 2).map((e) => mapRoute(e))

  function mapRoute(route: any, parentPath?: string) {
    const fullPath = parentPath ? `${parentPath}/${route.path}` : route.path
    return {
      title: route.title,
      url: fullPath,
      icon: route.icon,
      children:
        route.children
          ?.filter((e: any) => e.showSidebar)
          ?.map((child: any) => mapRoute(child, fullPath)) ?? [],
    }
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div onClick={scrollToTop} className="py-2 text-center cursor-pointer">
              <span className="text-primary text-base font-bold">Đăng Ký Xe - Minh Tú</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {navSecondary.length > 0 && (
          <NavSecondary items={navSecondary} className="mt-4" label="Quản lý đăng ký" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
