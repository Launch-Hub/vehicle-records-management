import { type ComponentProps } from 'react'
import {
  BarChartIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react'

import { NavMain } from '@/components/shared/sidebar/nav-main'
import { NavSecondary } from '@/components/shared/sidebar/nav-secondary'
import { NavUser } from '@/components/shared/sidebar/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { scrollToTop } from '@/lib/utils'
import { useAuth } from '@/contexts/auth'

const mock_data = {
  navMain: [
    {
      title: 'Bảng điều khiển',
      url: '/dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Quản lý hồ sơ',
      url: '/records',
      icon: FolderIcon,
    },
    {
      title: 'Quản lý nhân viên',
      url: '/users',
      icon: UsersIcon,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: SettingsIcon,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: HelpCircleIcon,
    },
    {
      title: 'Search',
      url: '#',
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: 'Data Library',
      url: '#',
      icon: DatabaseIcon,
    },
    {
      name: 'Reports',
      url: '#',
      icon: ClipboardListIcon,
    },
    {
      name: 'Word Assistant',
      url: '#',
      icon: FileIcon,
    },
  ],
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { user, isAuthenticated } = useAuth()
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div onClick={scrollToTop} className="cursor-pointer py-2 text-center">
              <span className="text-primary text-base font-bold">Đăng Ký Xe - Minh Tú</span>
              {/* <ArrowUpCircleIcon className="h-5 w-5" /> */}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mock_data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={mock_data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {isAuthenticated && <NavUser user={user!} />}
      </SidebarFooter>
    </Sidebar>
  )
}
