'use client'

import React from 'react'
import { SignOut } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/providers/ToastProvider'

interface LogoutProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  className?: string
}

export default function Logout({ variant = 'default', className = '' }: LogoutProps) {
  const router = useRouter()
  const { showToast } = useToast()

  // Улучшенная функция выхода с гарантированной очисткой данных
  const handleLogout = async () => {
    try {
      console.log('Выполняется выход из системы...')
      
      // Ключи, которые необходимо очистить
      const keysToRemove = [
        'samga-authorized-devices',
        'samga-current-device-id',
        'samga-current-device',
        'samga-main-device-id',
        'user-iin',
        'user-password',
        'samga-fast-reauth',
        'device-needs-reauth',
        'last-auth-source',
        'Access',
        'Refresh',
        'isLoggedIn'
      ]
      
      keysToRemove.forEach(key => {
        try { localStorage.removeItem(key) } catch {}
      })
      
      // Флаг «вышел из аккаунта», чтобы провайдеры не автологинили
      localStorage.setItem('samga-logout-flag', 'true')
      
      // Просим бэкенд удалить куки Access/Refresh
      try {
        await fetch('/api/logout', { method: 'POST' })
      } catch {}
      
      showToast('Выход выполнен успешно', 'success')
      setTimeout(() => { window.location.href = '/login' }, 400)
    } catch (error) {
      console.error('Критическая ошибка при выходе:', error)
      showToast('Ошибка при выходе из системы', 'error')
      setTimeout(() => { window.location.href = '/login' }, 800)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      className={className}
    >
      <SignOut className="mr-2 h-4 w-4" />
      Выйти
    </Button>
  )
} 