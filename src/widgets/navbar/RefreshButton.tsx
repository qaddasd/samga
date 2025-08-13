'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/lib/providers/ToastProvider'
import { ArrowsClockwise } from '@phosphor-icons/react'

const RefreshButton = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const handleRefresh = async () => {
    try {
      // Обновляем все кеши запросов
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contingent'] }),
        queryClient.invalidateQueries({ queryKey: ['journal'] }),
        queryClient.invalidateQueries({ queryKey: ['reports'] }),
        queryClient.invalidateQueries({ queryKey: ['rubric'] })
      ])
      
      // Показываем уведомление об успехе
      showToast('Данные успешно обновлены', 'success')
    } catch (error) {
      showToast('Ошибка при обновлении данных', 'error')
    }
  }

  return (
    <Button 
      onClick={handleRefresh} 
      variant="outline" 
      size="sm"
      className="gap-1.5"
    >
      <ArrowsClockwise size={18} weight="bold" />
      Обновить данные
    </Button>
  )
}

export default RefreshButton 