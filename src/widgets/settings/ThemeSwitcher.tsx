'use client'

import React, { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Desktop, Moon, Sun } from '@phosphor-icons/react'
import { useTheme } from 'next-themes'
import { useToast } from '@/lib/providers/ToastProvider'

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = (value: string) => {
    setTheme(value)
    
    const themeNames = {
      light: 'Светлая',
      dark: 'Темная',
      system: 'Системная'
    }
    
    showToast(`Тема изменена на: ${themeNames[value as keyof typeof themeNames]}`, 'info')
  }

  if (!mounted) {
    return null
  }

  return (
    <Tabs defaultValue={theme} onValueChange={handleThemeChange}>
      <TabsList className="transition-all duration-300">
        <TabsTrigger value="light" title="Светлая тема" className="transition-all duration-300">
          <Sun size={20} />
        </TabsTrigger>
        <TabsTrigger value="dark" title="Темная тема" className="transition-all duration-300">
          <Moon size={20} />
        </TabsTrigger>
        <TabsTrigger value="system" title="Системная тема" className="transition-all duration-300">
          <Desktop size={20} />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default ThemeSwitcher
