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
import { ArrowRight, ArrowLeft, Eye, EyeSlash, Spinner } from '@phosphor-icons/react'
import { login } from '@/server/actions/login'
import { useRouter } from 'next-nprogress-bar'
import { useToast } from '@/lib/providers/ToastProvider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useNotification } from '@/lib/providers/NotificationProvider'
import { CheckCircle } from '@phosphor-icons/react'

const schema = z.object({
  iin: z
    .string()
    .min(1, { message: 'Введите ИИН' })
    .regex(/^\d{12}$/, { message: 'ИИН должен содержать 12 цифр' }),
  password: z.string().min(1, { message: 'Введите пароль' }),
  rememberMe: z.boolean().optional(),
})

type AuthFormType = z.infer<typeof schema>

interface AuthFormProps {
  onToggleBenefits?: () => void
  benefitsOpen?: boolean
}

const AuthForm: React.FC<AuthFormProps> = ({ onToggleBenefits, benefitsOpen }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessEffect, setShowSuccessEffect] = useState(false);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
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
          
          // Устанавливаем флаг авторизации и снимаем флаг выхода
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.removeItem('samga-logout-flag');
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
    <div className="relative">
      {/* Эффект зеленого свечения при успешной авторизации */}
      {showSuccessEffect && (
        <div className="success-glow-effect"></div>
      )}
      {/* Переключатель панели преимуществ на ПК (закреплён у левого края формы) */}
      {onToggleBenefits && (
        <button
          type="button"
          aria-label={benefitsOpen ? 'Скрыть панель преимуществ' : 'Показать панель преимуществ'}
          onClick={onToggleBenefits}
          className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/40 transition-transform hover:scale-105 active:scale-95"
        >
          {benefitsOpen ? (
            <ArrowLeft className="h-5 w-5" />
          ) : (
            <ArrowRight className="h-5 w-5" />
          )}
        </button>
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
                        className="h-12 rounded-xl bg-muted/50 pl-4 pr-10 text-base transition-colors focus:bg-background" 
                        {...field} 
                      />
                      <div className="absolute bottom-1.5 right-3 text-[10px] leading-none text-muted-foreground select-none">
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
          
          {/* Кнопка открытия панели преимуществ — ниже полей, справа; на мобилках видна */}
          {onToggleBenefits && (
            <div className="mt-2 flex justify-end md:hidden">
              <button
                type="button"
                aria-label={benefitsOpen ? 'Скрыть панель преимуществ' : 'Показать панель преимуществ'}
                onClick={onToggleBenefits}
                className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-md ring-1 ring-primary/40 transition-transform hover:scale-105 active:scale-95"
              >
                {benefitsOpen ? (
                  <ArrowLeft className="h-5 w-5" />
                ) : (
                  <ArrowRight className="h-5 w-5" />
                )}
              </button>
            </div>
          )}
          
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
      
      <style jsx global>{`
        @keyframes glowEffect {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
          40% { box-shadow: 0 0 0 40px rgba(34, 197, 94, 0.22); }
          60% { box-shadow: 0 0 0 58px rgba(34, 197, 94, 0.18); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        
        .success-glow-effect {
          position: fixed;
          inset: 0;
          z-index: 100;
          pointer-events: none;
          border-radius: 24px;
          animation: glowEffect 1.8s ease-out forwards;
          /* Туманная зелёная дымка */
          box-shadow:
            0 0 0 6px rgba(34, 197, 94, 0.45),
            0 0 0 20px rgba(34, 197, 94, 0.22),
            0 0 0 40px rgba(34, 197, 94, 0.18);
        }
      `}</style>
    </div>
  )
}

export default AuthForm
