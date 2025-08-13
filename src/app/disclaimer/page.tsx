'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const DisclaimerPage = () => {
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
            Правовая информация
          </h1>
        </div>
        
        <div 
          className={`space-y-6 transition-all duration-700 delay-100 transform ${
            sectionsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Отказ от ответственности</h2>
            <p className="text-muted-foreground">
              Приложение SAMGA не является официальным продуктом Назарбаев Интеллектуальных школ. 
              Все данные, отображаемые в приложении, предоставляются исключительно в информационных целях.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Ограничение ответственности</h2>
            <p className="text-muted-foreground">
              Разработчики приложения не несут ответственности за точность, полноту или актуальность 
              информации, предоставляемой через API школы. Все решения, принимаемые на основе данных 
              из приложения, пользователь принимает на свой страх и риск.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 transition-all duration-500 hover:shadow-md">
            <h2 className="mb-3 text-xl font-semibold">Безопасность данных</h2>
            <p className="text-muted-foreground">
              Приложение SAMGA использует исключительно официальные API школы и не хранит логины и пароли 
              пользователей. Все данные аутентификации передаются напрямую серверам школы. Мы серьезно 
              относимся к безопасности пользовательских данных и используем современные стандарты шифрования.
            </p>
          </div>
        </div>
        
        <div 
          className={`mt-10 text-center transition-all duration-700 delay-200 transform ${
            footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm text-muted-foreground">
            Используя приложение SAMGA, вы соглашаетесь с этими условиями.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Последнее обновление: Март 2023
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

export default DisclaimerPage 