'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next-nprogress-bar'
import { ArrowLeft, House } from '@phosphor-icons/react'
import Logo from '@/components/misc/Logo'

const NotFound = () => {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Установка таймера обратного отсчета и редиректа
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // Когда таймер достигает 0, перенаправляем на главную
      router.push('/')
    }
  }, [countdown, router])

  return (
    <div className="items-center mx-auto flex h-screen max-w-md flex-col justify-center px-6 text-center">
      <div className="logo-container mb-6">
        <Logo width={80} height={80} className="fill-primary rotating-logo" />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">404</h1>
      <p className="text-xl font-medium mb-1">Ой! Вы кажется завернули не туда.</p>
      <p className="text-muted-foreground mb-8">
        Я вас верну на главную через <span className="font-bold text-primary">{countdown}</span> сек.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button 
          className="w-full" 
          onClick={() => router.push('/')}
        >
          <House weight="bold" className="mr-2" /> На главную
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2" /> Вернуться назад
        </Button>
      </div>
      
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
        }
        
        .logo-container {
          animation: bounce 3s ease-in-out infinite;
        }
        
        .rotating-logo {
          animation: spin 4s linear infinite;
        }
        
        .rotating-logo path:last-child {
          animation: rolling 2s ease-in-out infinite;
          transform-origin: center;
        }
        
        @keyframes rolling {
          0% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(90deg) scale(0.9);
          }
          50% {
            transform: rotate(180deg) scale(0.8);
          }
          75% {
            transform: rotate(270deg) scale(0.9);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default NotFound
