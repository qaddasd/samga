'use client'

import React, { createContext, useState, useContext, useCallback, FC, PropsWithChildren } from 'react'
import Toast, { ToastProps } from '@/components/ui/toast'

interface ToastContextProps {
  showToast: (message: string, type?: ToastProps['type']) => void
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const [toast, setToast] = useState<{
    visible: boolean
    message: string
    type: ToastProps['type']
  }>({
    visible: false,
    message: '',
    type: 'success',
  })

  const showToast = useCallback((message: string, type: ToastProps['type'] = 'success') => {
    setToast({ visible: true, message, type })
    
    // Автоматически скрывать через 3 секунды
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }))
    }, 3000)
  }, [])

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  )
}

export default ToastProvider 