import { type LucideIcon } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
}

interface NavMainProps {
  items: Array<NavItem>
}

export function NavMain({ items }: NavMainProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* <SidebarMenu>
          <SidebarMenuItem className="flex justify-between items-center gap-2">
            <SidebarMenuButton
              tooltip="Tạo hồ sơ mới"
              className="min-w-8 bg-primary text-primary-foreground duration-300 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <PlusCircleIcon />
              <span>Hồ sơ mới</span>
            </SidebarMenuButton>
            <SidebarMenuButton tooltip="Thông báo">
              <BellIcon />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu> */}
        <SidebarMenu>
          {items.map((item) => {
            const isActive = location.pathname.startsWith(item.url)
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => navigate(item.url)}
                  className={clsx(
                    'transition-colors duration-300 ease-in-out',
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'hover:bg-muted/50'
                  )}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
