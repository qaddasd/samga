'use client'

import { useState, useEffect } from 'react'

// Тип для определения платформы
export type Platform = 'android' | 'ios' | 'web' | 'unknown'

export interface NativePlatformHook {
  platform: Platform         // Определенная платформа
  isNative: boolean          // Запущено в нативном приложении
  isAndroid: boolean         // Запущено на Android
  isIOS: boolean             // Запущено на iOS
  isWeb: boolean             // Запущено в браузере
  appVersion: string | null  // Версия приложения
}

/**
 * Хук для определения и работы с нативными платформами
 * Определяет, запущено ли приложение в браузере или 
 * в нативном контейнере (Android/iOS через Capacitor)
 */
export const useNativePlatform = (): NativePlatformHook => {
  const [platform, setPlatform] = useState<Platform>('unknown')
  const [appVersion, setAppVersion] = useState<string | null>(null)
  
  useEffect(() => {
    const detectPlatform = async () => {
      try {
        // Проверяем наличие Capacitor в глобальном объекте
        if (
          typeof window !== 'undefined' && 
          'Capacitor' in window && 
          window.Capacitor && 
          window.Capacitor.getPlatform
        ) {
          const nativePlatform = window.Capacitor.getPlatform()
          
          switch (nativePlatform) {
            case 'android':
              setPlatform('android')
              break
            case 'ios':
              setPlatform('ios')
              break
            default:
              setPlatform('web')
          }
          
          // Получаем версию приложения, если доступно
          if (window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
            try {
              const info = await window.Capacitor.Plugins.App.getInfo()
              setAppVersion(info.version)
            } catch (err) {
              console.error('Ошибка при получении информации о приложении:', err)
            }
          }
        } else {
          // Если Capacitor недоступен, значит это браузер
          setPlatform('web')
          
          // Попытка получить версию из переменных окружения
          if (process.env.NEXT_PUBLIC_APP_VERSION) {
            setAppVersion(process.env.NEXT_PUBLIC_APP_VERSION)
          }
        }
      } catch (error) {
        console.error('Ошибка при определении платформы:', error)
        setPlatform('unknown')
      }
    }
    
    detectPlatform()
  }, [])
  
  return {
    platform,
    isNative: platform === 'android' || platform === 'ios',
    isAndroid: platform === 'android',
    isIOS: platform === 'ios',
    isWeb: platform === 'web',
    appVersion
  }
}

// Экспортируем типы для TypeScript
declare global {
  interface Window {
    Capacitor?: {
      getPlatform: () => string
      isPluginAvailable: (name: string) => boolean
      Plugins?: {
        [key: string]: any
        App?: {
          getInfo: () => Promise<{ version: string }>
        }
      }
    }
  }
}

export default useNativePlatform 