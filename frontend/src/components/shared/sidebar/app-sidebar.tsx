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

// const mock_data = {
//   // navMain: [
//   //   {
//   //     title: 'Bảng điều khiển',
//   //     url: '/dashboard',
//   //     icon: LayoutDashboardIcon,
//   //   },
//   //   {
//   //     title: 'Quản lý hồ sơ',
//   //     url: '/records',
//   //     icon: FolderIcon,
//   //   },
//   //   {
//   //     title: 'Quản lý nhân viên',
//   //     url: '/users',
//   //     icon: UsersIcon,
//   //   },
//   // ],
//   navSecondary: [
//     {
//       title: 'Settings',
//       url: '#',
//       icon: SettingsIcon,
//     },
//     {
//       title: 'Get Help',
//       url: '#',
//       icon: HelpCircleIcon,
//     },
//     {
//       title: 'Search',
//       url: '#',
//       icon: SearchIcon,
//     },
//   ],
//   documents: [
//     {
//       name: 'Data Library',
//       url: '#',
//       icon: DatabaseIcon,
//     },
//     {
//       name: 'Reports',
//       url: '#',
//       icon: ClipboardListIcon,
//     },
//     {
//       name: 'Word Assistant',
//       url: '#',
//       icon: FileIcon,
//     },
//   ],
// }

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const navMain = ROUTES.filter((e) => e.showSidebar).map((e) => mapRoute(e))

  function mapRoute(route: any) {
    return {
      title: route.title,
      url: route.path,
      icon: route.icon,
      children: route.children?.filter((e: any) => e.showSidebar)?.map(mapRoute) ?? [],
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
        {/* the below are currently not in use */}
        {/* <NavDocuments items={mock_data.documents} /> */}
        {/* <NavSecondary items={mock_data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
