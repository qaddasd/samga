'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from '@phosphor-icons/react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }
}

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const [showTutorialDialog, setShowTutorialDialog] = useState(false)
  const [isPWAInstalled, setIsPWAInstalled] = useState(false)
  const [device, setDevice] = useState<'android' | 'ios' | 'desktop'>('desktop')

  // Determine device type
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;
    
    if (/android/i.test(userAgent)) {
      setDevice('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setDevice('ios');
    } else {
      setDevice('desktop');
    }
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPWAInstalled(true);
    }
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      event.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(event)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])
  
  // Handle app installed event
  useEffect(() => {
    const handleAppInstalled = () => {
      setIsPWAInstalled(true)
      setDeferredPrompt(null)
      setShowInstallDialog(false)
      setShowTutorialDialog(false)
    }
    
    window.addEventListener('appinstalled', handleAppInstalled)
    
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])
  
  const openInstallDialog = () => {
    if (deferredPrompt) {
      // Открываем сразу диалог установки
      installPWA();
    } else {
      // Если нет нативной установки, показываем туториал
      setShowTutorialDialog(true)
    }
  }
  
  const installPWA = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      await deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setIsPWAInstalled(true)
      } else {
        console.log('User dismissed the install prompt')
      }
      
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null)
      setShowInstallDialog(false)
    }
  }
  
  if (isPWAInstalled) {
    return null
  }

  return (
    <>
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2 mt-4 mb-6"
        onClick={openInstallDialog}
      >
        <Download weight="bold" className="w-5 h-5" />
        Установить приложение
      </Button>
      
      {/* Диалог с инструкцией по установке */}
      <Dialog open={showTutorialDialog} onOpenChange={setShowTutorialDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Как установить приложение</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4">
            {device === 'android' && (
              <div className="space-y-2">
                <p className="font-medium">На Android:</p>
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  <li>Нажмите на значок меню (⋮) в правом верхнем углу</li>
                  <li>Выберите "Установить приложение" или "Добавить на главный экран"</li>
                  <li>Нажмите "Установить"</li>
                </ol>
              </div>
            )}
            
            {device === 'ios' && (
              <div className="space-y-2">
                <p className="font-medium">На iPhone/iPad:</p>
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  <li>Нажмите на кнопку "Поделиться" (квадрат со стрелкой) внизу экрана</li>
                  <li>Прокрутите вниз и нажмите "На экран «Домой»"</li>
                  <li>Нажмите "Добавить" в правом верхнем углу</li>
                </ol>
              </div>
            )}
            
            {device === 'desktop' && (
              <div className="space-y-2">
                <p className="font-medium">На компьютере:</p>
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  <li>В адресной строке нажмите на значок установки ⊕ справа</li>
                  <li>Нажмите "Установить"</li>
                  <li>Или используйте меню браузера: Настройки → Установить</li>
                </ol>
              </div>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground mt-2">
            После установки приложение будет доступно на главном экране устройства.
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowTutorialDialog(false)}>
              Понятно
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default InstallPWA 