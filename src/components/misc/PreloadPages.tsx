"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Компонент для предзагрузки страниц в определенном порядке
 * Предзагружает: главная → табель → цели → настройки → политики
 */
const PreloadPages = () => {
  const router = useRouter()

  useEffect(() => {
    // Массив путей к страницам в порядке приоритета предзагрузки
    const pagesToPreload = [
      '/', // Главная
      '/reports', // Табель
      '/goals', // Цели
      '/settings', // Настройки
      '/privacy', // Политики конфиденциальности
      '/terms', // Условия использования
    ]

    // Создаем функцию для последовательной предзагрузки страниц
    const preloadPagesSequentially = async () => {
      for (const path of pagesToPreload) {
        try {
          // Используем встроенный метод prefetch из Next.js Router
          await router.prefetch(path)
          // Добавляем небольшую задержку между запросами для снижения нагрузки
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`Ошибка предзагрузки страницы ${path}:`, error)
        }
      }
    }

    // Запускаем предзагрузку с небольшой задержкой после загрузки текущей страницы
    const timer = setTimeout(() => {
      preloadPagesSequentially()
    }, 500)

    return () => clearTimeout(timer)
  }, [router])

  // Компонент ничего не рендерит в DOM
  return null
}

export default PreloadPages 