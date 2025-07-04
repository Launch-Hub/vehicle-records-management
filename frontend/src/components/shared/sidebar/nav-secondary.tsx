import * as React from 'react'
import type { LucideIcon } from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import clsx from 'clsx'

export function NavSecondary({
  items,
  label,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
  label?: string
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              item.url === '/'
                ? location.pathname == item.url
                : location.pathname.startsWith(item.url)
            return (
              <SidebarMenuItem
                key={item.title}
                className={clsx(
                  'flex w-full items-center justify-between rounded-md text-sm transition-colors duration-300 ease-in-out',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'hover:bg-muted/50'
                )}
              >
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
