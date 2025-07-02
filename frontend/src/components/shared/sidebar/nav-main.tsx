import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useState } from 'react'

interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  children?: Array<NavItem>
}

interface NavMainProps {
  items: Array<NavItem>
}

export function NavMain({ items }: NavMainProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    )
  }

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
            const isActive =
              item.url === '/'
                ? location.pathname == item.url
                : location.pathname.startsWith(item.url)
            return (
              <SidebarMenuItem key={item.title}>
                {item.children?.length ? (
                  <Collapsible
                    open={openItems.includes(item.title)}
                    onOpenChange={() => toggleItem(item.title)}
                  >
                    <CollapsibleTrigger
                      className={clsx(
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors duration-300 ease-in-out',
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </div>
                      {openItems.includes(item.title) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6">
                      <SidebarMenu>
                        {item.children.map((child) => {
                          const isChildActive = location.pathname.startsWith(child.url)
                          return (
                            <SidebarMenuItem key={child.title}>
                              <SidebarMenuButton
                                tooltip={child.title}
                                onClick={() => navigate(child.url)}
                                className={clsx(
                                  'transition-colors duration-300 ease-in-out',
                                  isChildActive
                                    ? 'bg-primary text-primary-foreground font-semibold'
                                    : 'hover:bg-muted/50'
                                )}
                              >
                                {child.icon && <child.icon className="h-4 w-4" />}
                                <span>{child.title}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          )
                        })}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
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
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
