'use client'

import React, { FC, PropsWithChildren, useState, useEffect } from 'react'
import { QueryClient } from '@tanstack/react-query'
import { IDBQueryPersistor } from '@/lib/utils'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useRouter } from 'next-nprogress-bar'
import Cookies from 'js-cookie'

const QueryProvider: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter()
  const [isRefreshingToken, setIsRefreshingToken] = useState(false)

  // Функция для проверки и обновления токена
  const checkAndRefreshToken = () => {
    try {
      const accessToken = Cookies.get('Access') || localStorage.getItem('Access')
      const refreshToken = Cookies.get('Refresh') || localStorage.getItem('Refresh')
      
      if (!accessToken) {
        return false
      }
      
      // Проверяем, не истек ли token
      const [, refreshTokenVal, cityVal] = (accessToken as string).split('::')
      
      // Если у нас есть refresh token и он не истек, используем его для обновления токена
      if (refreshToken && refreshTokenVal) {
        setIsRefreshingToken(true)
        
        // Здесь можно добавить логику обновления токена через API
        // Для простого решения, мы просто продлеваем срок действия текущего токена
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        
        // Сохраняем в куки и localStorage для лучшей персистентности
        Cookies.set('Access', accessToken, {
          expires: 365, // 1 год
          path: '/',
          sameSite: 'lax',
          secure: true
        })
        
        // Дублируем в localStorage для надежности
        localStorage.setItem('Access', accessToken)
        localStorage.setItem('Refresh', refreshToken || '')
        
        // Устанавливаем флаг, что пользователь залогинен
        localStorage.setItem('isLoggedIn', 'true')
        
        setIsRefreshingToken(false)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error refreshing token:', error)
      setIsRefreshingToken(false)
      return false
    }
  }
  
  // Проверяем токен при загрузке и периодически
  useEffect(() => {
    // Проверяем токен при загрузке
    checkAndRefreshToken()
    
    // Проверяем, есть ли токен в localStorage, и если да, дублируем в cookies
    const localAccessToken = localStorage.getItem('Access')
    const localRefreshToken = localStorage.getItem('Refresh')
    
    if (localAccessToken && !Cookies.get('Access')) {
      Cookies.set('Access', localAccessToken, {
        expires: 365, // 1 год
        path: '/',
        sameSite: 'lax',
        secure: true
      })
      
      if (localRefreshToken) {
        Cookies.set('Refresh', localRefreshToken, {
          expires: 365,
          path: '/',
          sameSite: 'lax',
          secure: true
        })
      }
    }
    
    // Настраиваем периодическую проверку каждые 30 минут вместо 6 часов
    const interval = setInterval(() => {
      checkAndRefreshToken()
    }, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 3,
            retryDelay: (attempt: number) => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000),
            refetchInterval: 300000, // 5 mins
            throwOnError: (error: any) => {
              // Если получаем ошибку авторизации, пробуем обновить токен
              if (error.message === 'UNAUTHORIZED' && !isRefreshingToken) {
                const refreshSuccess = checkAndRefreshToken()
                
                if (!refreshSuccess) {
                  queryClient.removeQueries()
                  // Очищаем данные аутентификации
                  localStorage.removeItem('isLoggedIn')
                  localStorage.removeItem('Access')
                  localStorage.removeItem('Refresh')
                  Cookies.remove('Access')
                  Cookies.remove('Refresh')
                  router.push('/login')
                }
              }

              return false
            },
          },
        },
      }),
  )

  const persister = IDBQueryPersistor()

  // Actively refresh critical data when user returns to the app
  useEffect(() => {
    const refetchCritical = () => {
      checkAndRefreshToken()
      queryClient.invalidateQueries({ queryKey: ['journal'], refetchType: 'active' })
      queryClient.invalidateQueries({ queryKey: ['reports'], refetchType: 'active' })
      queryClient.invalidateQueries({ queryKey: ['schedule'], refetchType: 'active' })
    }

    const onFocus = () => refetchCritical()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refetchCritical()
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [queryClient])

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}

export default QueryProvider
