'use client'

import React, { useState, useEffect } from 'react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeSlash, QrCode, Spinner } from '@phosphor-icons/react'
import { login } from '@/server/actions/login'
import { useRouter } from 'next-nprogress-bar'
import { useToast } from '@/lib/providers/ToastProvider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useNotification } from '@/lib/providers/NotificationProvider'
import { CheckCircle } from '@phosphor-icons/react'
import QrScanner from '@/components/qr/QrScanner'
import { v4 as uuidv4 } from 'uuid'
import { verifyQrToken } from '@/lib/token/qr-auth'
import { Separator } from '@/components/ui/separator'

const schema = z.object({
  iin: z
    .string()
    .min(1, { message: 'Введите ИИН' })
    .regex(/^\d{12}$/, { message: 'ИИН должен содержать 12 цифр' }),
  password: z.string().min(1, { message: 'Введите пароль' }),
  rememberMe: z.boolean().optional(),
})

type AuthFormType = z.infer<typeof schema>

const AuthForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessEffect, setShowSuccessEffect] = useState(false);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  
  const form = useForm<AuthFormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      iin: '',
      password: '',
      rememberMe: true,
    }
  })

  const router = useRouter()
  const { showToast } = useToast()
  const { subscribeToNotifications, notificationsEnabled } = useNotification()

  // Загружаем сохраненные данные при монтировании компонента
  useEffect(() => {
    const savedData = localStorage.getItem('authData')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        form.setValue('iin', parsedData.iin || '')
        // Пароль не сохраняем для безопасности
      } catch (e) {
        console.error('Failed to parse saved auth data')
      }
    }
  }, [form])
  
  // Загружаем сохраненные данные при монтировании компонента
  useEffect(() => {
    const savedIin = localStorage.getItem('user-iin');
    const savedPassword = localStorage.getItem('user-password');
    
    if (savedIin) {
      form.setValue('iin', savedIin);
      
      if (savedPassword) {
        form.setValue('password', savedPassword);
      }
    }
    
    // Проверка поддержки уведомлений браузера
    checkNotificationPermission();
  }, [form]);
  
  // Обратный отсчет для перенаправления
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (showForgotPasswordDialog && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (showForgotPasswordDialog && countdown === 0) {
      // Перенаправление на страницу сброса пароля
      window.location.href = 'https://sms.akt.nis.edu.kz';
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, showForgotPasswordDialog]);
  
  // Сбрасываем таймер при закрытии диалога
  useEffect(() => {
    if (!showForgotPasswordDialog) {
      setCountdown(5);
    }
  }, [showForgotPasswordDialog]);
  
  // Функция проверки и запроса разрешения на уведомления
  const checkNotificationPermission = () => {
    if (!('Notification' in window)) {
      console.log('Этот браузер не поддерживает уведомления');
      return;
    }
    
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Разрешение на уведомления получено');
          
          // Регистрация сервис-воркера для фоновых уведомлений
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(
              registration => {
                console.log('ServiceWorker зарегистрирован');
              },
              error => {
                console.log('Ошибка регистрации ServiceWorker: ', error);
              }
            );
          }
        }
      });
    }
  };

  // Handle successful QR scan
  const handleQrScan = (data: string) => {
    try {
      // Parse QR code data
      const qrData = JSON.parse(data);
      
      if (qrData && qrData.token) {
        // Generate a device ID for this device
        const deviceId = uuidv4();
        
        // Attempt to verify the token from the main device
        const isValid = verifyQrToken(qrData.token);
        
        if (isValid) {
          // Store the device ID
          localStorage.setItem('samga-current-device-id', deviceId);
          
          // Copy auth tokens from the main device if they exist
          // This would be done server-side in a real implementation
          const mainDeviceAccessToken = localStorage.getItem('Access');
          const mainDeviceRefreshToken = localStorage.getItem('Refresh');
          
          if (mainDeviceAccessToken && mainDeviceRefreshToken) {
            // Set tokens for this device
            localStorage.setItem('Access', mainDeviceAccessToken);
            localStorage.setItem('Refresh', mainDeviceRefreshToken);
            localStorage.setItem('isLoggedIn', 'true');
            
            // Show success message
            showToast('Успешная авторизация по QR-коду', 'success');
            
            // Show success effect and redirect
            setLoginSuccess(true);
            setShowSuccessEffect(true);
            setShowQrScanner(false);
            
            // Redirect after delay
            setTimeout(() => {
              setShowSuccessEffect(false);
              router.push('/');
            }, 1500);
          } else {
            showToast('Ошибка авторизации: токены не найдены', 'error');
            setShowQrScanner(false);
          }
        } else {
          showToast('Недействительный QR-код или истёк срок действия', 'error');
        }
      } else {
        showToast('Неверный формат QR-кода', 'error');
      }
    } catch (error) {
      console.error('QR code scan error:', error);
      showToast('Ошибка при сканировании QR-кода', 'error');
    }
  };
  
  // Handle QR scanner error
  const handleQrError = (error: Error) => {
    console.error('QR scanner error:', error);
    showToast('Ошибка камеры при сканировании QR-кода', 'error');
  };

  const onSubmit: SubmitHandler<AuthFormType> = async ({ iin, password }) => {
    if (!iin || !password) {
      showToast('Введите логин и пароль', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login(iin, password);
      
      if (result.success) {
        setLoginSuccess(true);
        showToast('Вход выполнен успешно', 'success');
        
        // Subscribe to notifications automatically
        setTimeout(() => {
          subscribeToNotifications();
        }, 1000);
        
        // Сохраняем данные пользователя всегда
        try {
          const dataToSave = {
            iin,
            lastLogin: new Date().toISOString(),
            // Пароль не сохраняем для безопасности
          }
          localStorage.setItem('authData', JSON.stringify(dataToSave))
          
          // Сохраняем токены в localStorage для более надежной работы
          const accessToken = document.cookie.split('; ')
            .find(row => row.startsWith('Access='))
            ?.split('=')[1];
          
          const refreshToken = document.cookie.split('; ')
            .find(row => row.startsWith('Refresh='))
            ?.split('=')[1];
            
          if (accessToken) {
            localStorage.setItem('Access', accessToken);
          }
          
          if (refreshToken) {
            localStorage.setItem('Refresh', refreshToken);
          }
          
          // Устанавливаем флаг авторизации
          localStorage.setItem('isLoggedIn', 'true');
        } catch (e) {
          console.error('Failed to save auth data')
        }
        
        // Показываем анимацию успешной авторизации
        setShowSuccessEffect(true);
        
        // Убираем эффект через 1.5 секунды и выполняем переход
        setTimeout(() => {
          setShowSuccessEffect(false);
          router.push('/')
        }, 1500);
      } else {
        if (result.errors?.iin) form.setError('iin', { message: result.errors?.iin })
        if (result.errors?.password)
          form.setError('password', { message: result.errors?.password })
        
        // Показываем одну из ошибок или дефолтное сообщение
        const errorMessage = result.errors?.iin || result.errors?.password || 'Ошибка входа';
        showToast(errorMessage, 'error')
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Ошибка входа. Попробуйте позже.', 'error');
    }

    setLoading(false);
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {/* Эффект зеленого свечения при успешной авторизации */}
      {showSuccessEffect && (
        <div className="success-glow-effect"></div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="space-y-4">
          <FormField
            control={form.control}
            name="iin"
            render={({ field }) => (
                <FormItem>
                <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="ИИН" 
                        autoComplete="username" 
                        className="h-12 rounded-xl bg-muted/50 pl-4 text-base transition-colors focus:bg-background" 
                        {...field} 
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {field.value.length}/12
                      </div>
                    </div>
                </FormControl>
                  <FormMessage className="text-xs font-medium text-red-500" />
              </FormItem>
            )}
          />
            
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Пароль"
                      autoComplete="current-password"
                      type={showPassword ? "text" : "password"}
                        className="h-12 rounded-xl bg-muted/50 pl-4 text-base transition-colors focus:bg-background"
                      {...field}
                    />
                    <button 
                      type="button"
                      onClick={toggleShowPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlash className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                  <FormMessage className="text-xs font-medium text-red-500" />
              </FormItem>
            )}
          />
          </div>
          
          <div className="flex justify-end mt-2 mb-6">
            <button 
              type="button" 
              className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
              onClick={() => setShowForgotPasswordDialog(true)}
            >
              Забыли пароль?
            </button>
          </div>
          
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            disabled={loading || loginSuccess}
          >
            {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
            {loginSuccess && <CheckCircle className="mr-2 h-4 w-4" />}
            {loginSuccess ? 'Вход выполнен' : 'Войти'}
          </Button>
          
          <div className="relative flex items-center justify-center my-6">
            <Separator className="flex-1" />
            <span className="mx-4 text-xs text-muted-foreground">или</span>
            <Separator className="flex-1" />
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl text-base font-medium"
            onClick={() => setShowQrScanner(true)}
          >
            <QrCode className="mr-2 h-5 w-5" />
            Войти по QR-коду
          </Button>
        </form>
      </Form>
      
      {/* Диалог для сброса пароля */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>Восстановление пароля</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-lg font-medium mb-6">
              Перенаправление на страницу восстановления пароля через:
            </p>
            <div className="text-4xl font-bold text-primary mb-6">
              {countdown}
            </div>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Вы будете автоматически перенаправлены на сайт SMS.AKT.NIS.EDU.KZ
            </p>
            <Button 
              variant="outline" 
              onClick={() => setShowForgotPasswordDialog(false)}
              className="rounded-lg"
            >
              Отмена
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* QR Scanner Dialog */}
      <Dialog open={showQrScanner} onOpenChange={setShowQrScanner}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Сканирование QR-кода</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <QrScanner 
              onScan={handleQrScan}
              onError={handleQrError}
              onClose={() => setShowQrScanner(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <style jsx global>{`
        @keyframes glowEffect {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(34, 197, 94, 0.3);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }
        
        .success-glow-effect {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 100;
          pointer-events: none;
          border: 8px solid rgba(34, 197, 94, 0.4);
          border-radius: 10px;
          animation: glowEffect 1.5s ease-out forwards;
        }
      `}</style>
    </>
  )
}

export default AuthForm
