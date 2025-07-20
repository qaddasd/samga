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
  const handleLogout = () => {
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
        'last-auth-source'
      ]
      
      // Попытка очистить все ключи
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key)
          console.log(`Ключ ${key} успешно удален`)
        } catch (e) {
          console.error(`Ошибка при удалении ключа ${key}:`, e)
        }
      })
      
      // Устанавливаем флаг выхода из системы
      localStorage.setItem('samga-logout-flag', 'true')
      
      // Двойная проверка критических ключей
      if (localStorage.getItem('user-iin') || localStorage.getItem('user-password')) {
        console.warn('ВНИМАНИЕ! Критические данные не были очищены, принудительная очистка...')
        
        // Принудительная очистка
        localStorage.clear()
        
        // Восстанавливаем только флаг выхода
        localStorage.setItem('samga-logout-flag', 'true')
      }
      
      // Показываем уведомление
      showToast('Выход выполнен успешно', 'success')
      
      // Переходим на страницу входа с задержкой
      setTimeout(() => {
        window.location.href = '/login'
      }, 500)
      
    } catch (error) {
      console.error('Критическая ошибка при выходе:', error)
      showToast('Ошибка при выходе из системы', 'error')
      
      // В случае ошибки выполняем принудительный переход
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
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