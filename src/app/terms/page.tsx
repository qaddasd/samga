'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const TermsPage = () => {
  const [headerVisible, setHeaderVisible] = useState(false)
  const [sectionsVisible, setSectionsVisible] = useState(false)
  const [footerVisible, setFooterVisible] = useState(false)
  
  useEffect(() => {
    const headerTimer = setTimeout(() => setHeaderVisible(true), 100)
    const sectionsTimer = setTimeout(() => setSectionsVisible(true), 300)
    const footerTimer = setTimeout(() => setFooterVisible(true), 600)
    
    return () => {
      clearTimeout(headerTimer)
      clearTimeout(sectionsTimer)
      clearTimeout(footerTimer)
    }
  }, [])
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div 
          className={`transition-all duration-500 transform ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link href="/">
            <Button variant="ghost" className="mb-4">← Вернуться на главную</Button>
          </Link>
          
          <h1 className="mb-6 text-3xl font-bold">
            Условия использования
          </h1>
        </div>
        
        <div 
          className={`space-y-6 transition-all duration-700 delay-100 transform ${
            sectionsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Общие положения</h2>
            <p className="text-muted-foreground">
              Данные условия регулируют использование Дневника SAMGA (https://samga.top/), 
              улучшенной версии nis mektep с повышенной скоростью входа и работы.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Минимальный набор данных для входа</h2>
            <p className="text-muted-foreground">
              Для авторизации в сервисе пользователь предоставляет только ИИН и пароль, 
              что обеспечивает быстрый доступ.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Локальное хранение учетных данных</h2>
            <p className="text-muted-foreground">
              Вся информация, необходимая для входа, хранится исключительно на устройстве 
              пользователя и не передаётся на централизованные серверы.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Сбор технических данных</h2>
            <p className="text-muted-foreground">
              Дополнительно сохраняются IP-адрес, тип устройства и браузер для повышения 
              безопасности и оптимизации работы сервиса; данные не используются в иных целях.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Ответственность пользователя</h2>
            <p className="text-muted-foreground">
              Пользователь обязуется самостоятельно обеспечивать безопасность своего устройства 
              и использовать надёжные пароли для защиты учетных данных.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Ограничение ответственности</h2>
            <p className="text-muted-foreground">
              Владелец сервиса не несёт ответственности за последствия утраты данных, 
              если это произошло вследствие нарушения рекомендаций по безопасности пользователем.
            </p>
          </div>
        </div>
        
        <div 
          className={`mt-10 text-center transition-all duration-700 delay-200 transform ${
            footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm text-muted-foreground">
            Используя приложение SAMGA, вы подтверждаете, что прочитали и поняли условия использования.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Последнее обновление: Март 2025
          </p>
          
          <div className="mt-6">
            <Link href="/">
              <Button>Вернуться на главную</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsPage 