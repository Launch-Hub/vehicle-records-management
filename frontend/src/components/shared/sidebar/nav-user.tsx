import { BellIcon, LogOutIcon, MoreVerticalIcon, UserCircleIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/auth'
import { useState } from 'react'
import ProfileDialog from '@/components/page/profile/dialog'
import { toast } from 'sonner'
import type { User } from '@/lib/types/tables.type'

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, logout, updateProfile } = useAuth()
  const [isProfileOpen, setProfileOpen] = useState(false)
  const [isDropdownOpen, setDropdownOpen] = useState(false)

  const openProfile = async () => {
    setProfileOpen(true)
    setDropdownOpen(false)
  }

  const handleProfileSubmit = async (action: string, data: Omit<User, '_id'>) => {
    try {
      await updateProfile(data)
      toast.success('Cập nhật thông tin thành công.')
      setProfileOpen(false)
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast.error(
        error.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.'
      )
    }
  }

  if (!user) return <></>

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 grayscale">
                  <AvatarImage src={user.avatar || '/avatars/shadcn.jpg'} alt={user.name} />
                  <AvatarFallback className="">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
                <MoreVerticalIcon className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            {/* popup */}
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer" onClick={openProfile}>
                  <UserCircleIcon />
                  Tài khoản
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" disabled>
                  <BellIcon />
                  Thông báo
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                <LogOutIcon />
                Đăng Xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <ProfileDialog
        open={isProfileOpen}
        onClose={() => setProfileOpen(false)}
        onSubmit={handleProfileSubmit}
        initialData={user ? { ...user } : undefined}
        isSelfEdit={true}
      />
    </>
  )
}
