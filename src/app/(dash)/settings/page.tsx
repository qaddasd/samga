'use client'

import React, { useEffect, useState } from 'react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import ResponsiveModal from '@/components/ui/responsive-modal'
import { QrCode, SignOut } from '@phosphor-icons/react'
import { useToast } from '@/lib/providers/ToastProvider'
import { logout } from '@/server/actions/logout'
import { useRouter } from 'next-nprogress-bar'
import { useQueryClient } from '@tanstack/react-query'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import useSettingsStore from '@/lib/hooks/store/useSettingsStore'
import ThemeSwitcher from '@/components/ui/theme-switcher'
import { env } from '@/env'
import useNativePlatform from '@/lib/hooks/useNativePlatform'
import QrGenerator from '@/components/qr/QrGenerator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DeviceConnection, getConnectedDevices } from '@/lib/token/qr-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const Page = () => {
  const { showToast } = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [sort, setSort] = useState<'asc' | 'score-up' | 'score-down'>('score-down')
  const [gpaSystem, setGpaSystem] = useState<'4' | '5'>('5')
  const { updateSort, updateGpaSystem } = useSettingsStore()
  const { appVersion } = useNativePlatform()
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [connectedDevices, setConnectedDevices] = useState<DeviceConnection[]>([])
  
  // Безопасная инициализация состояния из хранилища
  useEffect(() => {
    // Получаем состояние из хранилища только на клиенте
    const settings = useSettingsStore.getState()
    setSort(settings.sort)
    setGpaSystem(settings.gpaSystem || '5')
    
    // Load connected devices
    if (typeof window !== 'undefined') {
      setConnectedDevices(getConnectedDevices())
    }
  }, [])
  
  // Обработчик изменения сортировки
  const handleSortChange = (newSort: 'asc' | 'score-up' | 'score-down') => {
    setSort(newSort)
    updateSort(newSort)
  }
  
  // Обработчик изменения системы GPA
  const handleGpaSystemChange = (newSystem: '4' | '5') => {
    setGpaSystem(newSystem)
    updateGpaSystem(newSystem)
    showToast(`Система GPA изменена на ${newSystem}-балльную`, 'success')
  }

  // Format device connection date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Remove a connected device
  const removeDevice = (deviceId: string) => {
    try {
      const devices = getConnectedDevices()
      const updatedDevices = devices.filter(device => device.deviceId !== deviceId)
      localStorage.setItem('samga-authorized-devices', JSON.stringify(updatedDevices))
      setConnectedDevices(updatedDevices)
      showToast('Устройство отключено', 'success')
    } catch (error) {
      console.error('Failed to remove device:', error)
      showToast('Ошибка при отключении устройства', 'error')
    }
  }

  // Безопасное удаление данных при выходе
  const handleLogout = () => {
    queryClient.removeQueries()
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('user-iin')
        localStorage.removeItem('user-password')
        localStorage.removeItem('samga-current-device-id')
        localStorage.removeItem('samga-authorized-devices')
        localStorage.removeItem('Access')
        localStorage.removeItem('Refresh')
        localStorage.removeItem('isLoggedIn')
      } catch (error) {
        console.error('Ошибка при очистке хранилища:', error)
      }
    }
    showToast('Выход выполнен успешно', 'success')
    logout().then(() => router.push('/login'))
  }

  return (
    <div className="mx-auto page-transition">
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold leading-tight tracking-tight first:mt-0">
        Настройки
      </h2>

      <div className="mt-6">
        <h3 className="scroll-m-20 text-xl font-semibold leading-tight tracking-tight">
          Основные
        </h3>
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div className="flex flex-row items-center justify-between py-1.5">
            <p className="text-lg">Тема оформления</p>
            <ThemeSwitcher />
          </div>
          
          <div className="flex flex-row items-center justify-between py-1.5">
            <p className="text-lg">Сортировка</p>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                <SelectItem value="asc">По алфавиту</SelectItem>
                <SelectItem value="score-up">По возрастанию</SelectItem>
                <SelectItem value="score-down">По убыванию</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-row items-center justify-between py-1.5">
            <p className="text-lg">Система GPA</p>
            <Select value={gpaSystem} onValueChange={handleGpaSystemChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="GPA" />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                <SelectItem value="5">5-балльная</SelectItem>
                <SelectItem value="4">4-балльная</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-row items-center justify-between py-1.5">
            <p className="text-lg">Версия</p>
            <div className="text-sm bg-primary/10 px-2.5 py-1 rounded-full font-medium text-primary">
              {appVersion || env.NEXT_PUBLIC_APP_VERSION || '2.5'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="scroll-m-20 text-xl font-semibold leading-tight tracking-tight">
          Устройства
        </h3>
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div className="flex flex-row items-center justify-between py-1.5">
            <div>
              <p className="text-lg">Подключение устройств</p>
              <p className="text-sm text-muted-foreground">Подключите другое устройство с помощью QR-кода</p>
            </div>
            <Button 
              onClick={() => setShowQrDialog(true)}
              className="flex gap-2"
            >
              <QrCode size={18} />
              <span>Показать QR</span>
            </Button>
          </div>
          
          {connectedDevices.length > 0 && (
            <div className="space-y-3 mt-2">
              <p className="font-medium">Подключенные устройства:</p>
              {connectedDevices.map((device) => (
                <div key={device.deviceId} className="bg-muted rounded-md p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{device.deviceId.substring(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground">
                      Подключено: {formatDate(device.connectedAt)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeDevice(device.deviceId)}
                  >
                    Отключить
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Separator className="my-8" />
      
      <div className="flex flex-row items-center justify-between py-1.5">
        <p className="text-xl lg:text-2xl">Выход</p>
        <ResponsiveModal
          trigger={
            <Button>
              <SignOut size={18} className="mr-1.5" /> Выйти
            </Button>
          }
          title={
            <span className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
              Подтвердите действие
            </span>
          }
          close={<Button variant="outline">Отмена</Button>}
        >
          Выход из аккаунта сотрёт все локальные данные о вас, вам придётся
          заново входить в свой аккаунт. Вы уверены?
          <Button
            className="mt-3 w-full"
            onClick={handleLogout}
          >
            Подтвердить выход
          </Button>
        </ResponsiveModal>
      </div>

      <p className="-mb-12 mt-4 text-muted-foreground sm:-mb-0">
        Приложение не имеет никакого отношения к АОО НИШ. Некоторые данные
        хранятся локально на вашем устройстве. Они никуда не передаются, не
        обрабатываются.
      </p>
      
      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Подключение устройства</DialogTitle>
            <DialogDescription>
              Отсканируйте этот QR-код на другом устройстве для входа в аккаунт
            </DialogDescription>
          </DialogHeader>
          
          <QrGenerator />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Page
