'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const PrivacyPage = () => {
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
            Политика конфиденциальности
          </h1>
        </div>
        
        <div 
          className={`space-y-6 transition-all duration-700 delay-100 transform ${
            sectionsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Сбор минимальных данных</h2>
            <p className="text-muted-foreground">
              Для входа в аккаунт запрашиваются только ИИН и пароль, что позволяет 
              обеспечить быструю и безопасную авторизацию.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Локальное хранение</h2>
            <p className="text-muted-foreground">
              Введённые учетные данные сохраняются исключительно локально на устройстве 
              пользователя и не передаются на центральные серверы.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Сбор дополнительных данных</h2>
            <p className="text-muted-foreground">
              Для внутренней статистики мы автоматически сохраняем IP-адрес, тип устройства 
              и браузер. Эти данные не используются для анализа активности пользователя, 
              а лишь для обеспечения безопасности и отладки работы сервиса.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Полная защита информации</h2>
            <p className="text-muted-foreground">
              Все собираемые данные, включая технические параметры, находятся под надёжной 
              защитой с использованием современных методов шифрования и технических мер.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Отсутствие аналитики персональных данных</h2>
            <p className="text-muted-foreground">
              Личные данные не анализируются для коммерческих целей или рекламы; 
              дополнительная информация хранится исключительно в целях технического обслуживания.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Поддержка через Telegram</h2>
            <p className="text-muted-foreground">
              Все вопросы и обращения пользователей обрабатываются через наш официальный 
              Telegram-канал, информация о котором размещена на сайте.
            </p>
          </div>
        </div>
        
        <div 
          className={`mt-10 text-center transition-all duration-700 delay-200 transform ${
            footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm text-muted-foreground">
            Используя приложение SAMGA, вы соглашаетесь с нашей политикой конфиденциальности.
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

export default PrivacyPage 