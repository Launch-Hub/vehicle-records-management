import { changeTheme } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const themes = ['default', 'blue', 'green', 'orange', 'violet']

export const ThemeChanger = () => {
  const handleChange = (e: string) => {
    changeTheme(e)
  }

  return (
    <Select onValueChange={handleChange} defaultValue="default">
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {themes.map((theme) => (
            <SelectItem key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
