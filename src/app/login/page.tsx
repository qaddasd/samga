'use client'

import React from 'react'
import AuthForm from '@/widgets/login/AuthForm'
import Logo from '@/components/misc/Logo'
import { useRouter } from 'next-nprogress-bar'
import { useToast } from '@/lib/providers/ToastProvider'
import { login } from '@/server/actions/login'
import InstallPWA from '@/components/misc/InstallPWA'

const Page = () => {
  const router = useRouter()
  const { showToast } = useToast()
  
  return (
    <div className="items-left mx-auto flex h-screen max-w-96 flex-col justify-center p-4 text-left page-transition">
      <div className="mb-6 flex items-center">
        <Logo width={48} height={48} className="mr-3" withText={true} />
      </div>
      
      <h2 className="w-full scroll-m-20 text-left text-3xl font-semibold leading-none tracking-tight first:mt-0">
        Вход
      </h2>

      <p className="w-full text-left leading-7 text-muted-foreground mb-4">
        Используйте свой аккаунт СУШ
      </p>

      <AuthForm />
      
      <InstallPWA />
      
      <div className="mt-4 flex flex-col items-center space-y-3 text-sm text-muted-foreground">
        <a href="https://qynon.site" target="_blank" rel="noopener" className="hover:text-primary transition-colors">
          Создано qynon
        </a>
        
        <a 
          href="https://t.me/samgay_nis" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-blue-500 hover:text-blue-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.568 8.16c-.18 1.896-.96 6.504-1.356 8.628-.168.9-.504 1.2-.816 1.236-.696.06-1.224-.456-1.896-.9-1.056-.696-1.656-1.128-2.676-1.8-1.188-.78-.42-1.212.264-1.908.18-.18 3.252-2.976 3.312-3.228.007-.034.014-.102-.038-.144s-.15-.03-.211-.018c-.09.024-1.526.96-4.308 2.82-.408.276-.78.408-1.116.396-.366-.012-1.068-.204-1.59-.372-.642-.204-1.152-.312-1.104-.66.024-.18.324-.36.9-.54 3.516-1.536 5.868-2.556 7.056-3.06 3.36-1.44 4.056-1.68 4.5-1.68.108 0 .348.024.504.144.132.096.216.24.24.408.036.18.024.36.012.516z"></path>
          </svg>
          Telegram канал
        </a>
      </div>
    </div>
  )
}

export default Page
