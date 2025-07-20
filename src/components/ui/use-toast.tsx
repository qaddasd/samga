'use client'

import { createContext, useContext } from 'react'

type ToastType = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

type ToastContextType = {
  toast: (props: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {
    // Базовая реализация тоста
    console.log('Toast triggered')
  }
})

export const useToast = () => {
  return useContext(ToastContext)
} 