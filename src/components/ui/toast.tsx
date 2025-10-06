'use client'

import React from 'react'
import { Check, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  visible: boolean
  message: string
  type?: 'success' | 'error' | 'info'
  onClose?: () => void
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'success',
  onClose,
}) => {
  if (!visible) return null

  return (
    <div
      className={cn(
        'fixed left-1/2 top-4 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-lg p-4 shadow-lg',
        'animate-in fade-in slide-in-from-top-5 duration-300',
        type === 'success' && 'bg-primary text-white',
        type === 'error' && 'bg-destructive text-white',
        type === 'info' && 'bg-secondary text-foreground'
      )}
    >
      {type === 'success' && <Check size={24} weight="bold" />}
      {type === 'error' && <X size={24} weight="bold" />}
      <span className="font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 rounded-full p-1 hover:bg-black/10"
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}

export default Toast 