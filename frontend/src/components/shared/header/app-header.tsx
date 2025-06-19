import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useLayout } from '@/contexts/layout'
import { getRouteField } from '@/routes'
import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ThemeSwitcher } from '@/components/shared/theme/theme-switcher'
import { ThemeChanger } from '@/components/shared/theme/theme-changer'

export function AppHeader() {
  const { pathname } = useLocation()
  const { title, setTitle } = useLayout()

  useLayoutEffect(() => {
    const title = getRouteField('title', pathname)
    if (title) setTitle(title)
  }, [pathname])

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {/* left section */}
        <div className="flex flex-1 items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <h1 className="text-base font-medium">{title}</h1>
        </div>

        {/* right section */}
        <div>
          {/* <ThemeChanger /> */}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
