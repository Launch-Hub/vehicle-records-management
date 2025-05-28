import React from 'react'
import { switchTheme } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

const themes = ['default', 'blue', 'green', 'orange', 'violet']

export const ThemeSwitcher: React.FC = () => {
  const handleChange = (e: string) => {
    switchTheme(e)
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
