'use client'

import React from 'react'
import AuthForm from '@/widgets/login/AuthForm'
import Logo from '@/components/misc/Logo'
import { useRouter } from 'next-nprogress-bar'
import { useToast } from '@/lib/providers/ToastProvider'
import { login } from '@/server/actions/login'
import InstallPWA from '@/components/misc/InstallPWA'
import BenefitsPanel from '@/widgets/login/BenefitsPanel'
import { AnimatePresence, motion } from 'framer-motion'
import ThemeSwitcher from '@/components/ui/theme-switcher'

const Page = () => {
  const router = useRouter()
  const { showToast } = useToast()
  const [showBenefits, setShowBenefits] = React.useState(false)
  
  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="relative flex h-full w-full">
        <motion.div
          initial={false}
          animate={{ width: showBenefits ? '55%' : '0%' }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="hidden h-full overflow-hidden bg-muted/10 md:block"
        >
          <BenefitsPanel />
        </motion.div>

        <motion.div
          initial={false}
          animate={{ width: showBenefits ? '45%' : '100%' }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="relative flex h-full items-center justify-center overflow-hidden"
        >
          {/* Синеголубой мягкий градиент на фоне формы */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(37,99,235,0.22)_0%,rgba(14,165,233,0.18)_35%,rgba(2,6,23,0.0)_75%)]" />
          <div className="pointer-events-none absolute inset-0 mix-blend-soft-light bg-[linear-gradient(120deg,rgba(37,99,235,0.22)_0%,rgba(14,165,233,0.18)_40%,rgba(56,189,248,0.14)_70%,rgba(37,99,235,0.22)_100%)]" />
          {/* Точечный паттерн (и в светлой теме тоже) */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:radial-gradient(rgba(255,255,255,0.32)_1.2px,transparent_1.2px)] [background-size:22px_22px] [background-position:0_0] dark:opacity-[0.20]" />
          {/* Туманная граница между панелями, без «чёрного пятна» в светлой теме */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-56 backdrop-blur-sm [mask-image:linear-gradient(to_right,black,transparent)] [background:radial-gradient(closest-side,rgba(59,130,246,0.20),rgba(59,130,246,0.0)_75%)] dark:[background:radial-gradient(closest-side,rgba(2,6,23,0.55),rgba(2,6,23,0.0)_75%)]" />
          {/* Голубой orb справа сверху для баланса с левой панелью */}
          <div className="orb right-6 top-8 h-36 w-36" style={{ background: 'radial-gradient(closest-side, rgba(14,165,233,0.5), rgba(14,165,233,0.0) 70%)' }} />
          <div className="relative z-10 items-left mx-auto flex w-full max-w-96 flex-col justify-center p-4 text-left page-transition">
            {/* Переключатель темы в правом верхнем углу формы */}
            <div className="absolute right-4 top-4 z-20">
              <ThemeSwitcher />
            </div>
      <div className="mb-6 flex items-center">
        <Logo width={48} height={48} className="mr-3" withText={true} />
      </div>
      
      <h2 className="w-full scroll-m-20 text-left text-3xl font-semibold leading-none tracking-tight first:mt-0">
        Вход
      </h2>

            <p className="mb-4 w-full text-left leading-7 text-muted-foreground">
        Используйте свой аккаунт СУШ
      </p>

            <AuthForm onToggleBenefits={() => setShowBenefits((v) => !v)} benefitsOpen={showBenefits} />
      
      <InstallPWA />
      
      <div className="mt-4 flex flex-col items-center space-y-3 text-sm text-muted-foreground">
              <a href="https://qynon.site" target="_blank" rel="noopener" className="transition-colors hover:text-primary">
          Создано qynon
        </a>
        
        <a 
          href="https://t.me/samgay_nis" 
          target="_blank" 
          rel="noopener noreferrer"
                className="flex items-center text-blue-500 transition-colors hover:text-blue-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.568 8.16c-.18 1.896-.96 6.504-1.356 8.628-.168.9-.504 1.2-.816 1.236-.696.06-1.224-.456-1.896-.9-1.056-.696-1.656-1.128-2.676-1.8-1.188-.78-.42-1.212.264-1.908.18-.18 3.252-2.976 3.312-3.228.007-.034.014-.102-.038-.144s-.15-.03-.211-.018c-.09.024-1.526.96-4.308 2.82-.408.276-.78.408-1.116.396-.366-.012-1.068-.204-1.59-.372-.642-.204-1.152-.312-1.104-.66.024-.18.324-.36.9-.54 3.516-1.536 5.868-2.556 7.056-3.06 3.36-1.44 4.056-1.68 4.5-1.68.108 0 .348.024.504.144.132.096.216.24.24.408.036.18.024.36.012.516z"></path>
          </svg>
          Telegram канал
        </a>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showBenefits && (
            <motion.div
              key="benefits-mobile"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="fixed inset-0 z-20 bg-background p-6 md:hidden"
            >
              <BenefitsPanel />
              <button
                onClick={() => setShowBenefits(false)}
                className="absolute right-4 top-4 rounded-full border px-3 py-1 text-sm"
              >
                Закрыть
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Page
