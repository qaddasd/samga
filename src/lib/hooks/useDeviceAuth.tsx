'use client'

import { useState, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { DeviceInfo } from './useNFC'

// Интерфейс хука
export interface DeviceAuthHook {
  // Список устройств, авторизованных текущим пользователем
  authorizedDevices: DeviceInfo[]
  // Авторизация нового устройства
  authorizeDevice: (iin: string, password: string) => DeviceInfo | null
  // Отзыв доступа для устройства
  revokeDevice: (deviceId: string) => boolean
  // Подготовка данных для передачи через NFC
  prepareAuthData: () => string
  // Текущее устройство авторизовано через другое устройство?
  isCurrentDeviceShared: boolean
  // Проверка, может ли устройство авторизовать другие устройства
  canAuthorizeOthers: boolean
  // Сколько осталось мест для подключения устройств
  remainingSlots: number
  // Функция очистки всех устройств (для отладки)
  clearAllDevices: () => boolean
}

// Ключ для localStorage
const DEVICES_STORAGE_KEY = 'samga-authorized-devices'
const CURRENT_DEVICE_KEY = 'samga-current-device-id'
const MAIN_DEVICE_KEY = 'samga-main-device-id'
// Максимальное время жизни устройства без обновления (в миллисекундах) - 7 дней
const MAX_DEVICE_LIFETIME = 7 * 24 * 60 * 60 * 1000;
// Максимальное количество устройств, которые можно авторизовать
const MAX_DEVICES = 5;

// Получить браузер и ОС
const getBrowserInfo = (): string => {
  const userAgent = navigator.userAgent
  let browserName = 'Неизвестный браузер'
  
  if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome'
  } else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox'
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari'
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    browserName = 'Opera'
  } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg') > -1) {
    browserName = 'Edge'
  } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
    browserName = 'Internet Explorer'
  }
  
  // Определение ОС
  let osName = 'Неизвестная ОС'
  if (userAgent.indexOf('Win') > -1) {
    osName = 'Windows'
  } else if (userAgent.indexOf('Mac') > -1) {
    osName = 'MacOS'
  } else if (userAgent.indexOf('Linux') > -1) {
    osName = 'Linux'
  } else if (userAgent.indexOf('Android') > -1) {
    osName = 'Android'
  } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
    osName = 'iOS'
  }
  
  return `${browserName} на ${osName}`
}

export const useDeviceAuth = (): DeviceAuthHook => {
  // Список устройств
  const [authorizedDevices, setAuthorizedDevices] = useState<DeviceInfo[]>([])
  // Статус текущего устройства
  const [isCurrentDeviceShared, setIsCurrentDeviceShared] = useState(false)
  // Может ли текущее устройство авторизовать другие
  const [canAuthorizeOthers, setCanAuthorizeOthers] = useState(true)
  // Оставшееся количество слотов для устройств
  const [remainingSlots, setRemainingSlots] = useState(MAX_DEVICES)
  // ID основного устройства
  const [mainDeviceId, setMainDeviceId] = useState<string | null>(null)
  
  // Загрузка данных об устройствах
  useEffect(() => {
    try {
      // Загружаем список авторизованных устройств
      const storedDevices = localStorage.getItem(DEVICES_STORAGE_KEY)
      let devices: DeviceInfo[] = []
      
      if (storedDevices) {
        try {
          devices = JSON.parse(storedDevices)
          console.log('Загружено устройств:', devices.length);
          
          // Добавляем флаг isNFCAuthorized для устройств, если он отсутствует
          devices = devices.map(device => {
            // Проверяем, имеет ли устройство флаг isNFCAuthorized
            if ('isNFCAuthorized' in device) {
              return device; // У устройства уже есть этот флаг
            }
            
            // Проверяем, является ли это текущим устройством
            const currentId = localStorage.getItem(CURRENT_DEVICE_KEY);
            const isNfcAuth = localStorage.getItem('device-nfc-authorized') === 'true';
            
            // Если это текущее устройство и оно авторизовано через NFC
            if (currentId === device.id && isNfcAuth) {
              return {
                ...device,
                isNFCAuthorized: true
              };
            }
            
            return device;
          });
          
          // Сохраняем обновленный список с флагами
          localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices));
        } catch (e) {
          console.error('Ошибка при парсинге данных об устройствах:', e)
        }
      } else {
        console.log('Нет сохраненных устройств')
      }
      
      // Проверяем наличие главного устройства
      const mainDevice = localStorage.getItem(MAIN_DEVICE_KEY)
      if (mainDevice) {
        setMainDeviceId(mainDevice)
      } else {
        // Если это первое устройство, устанавливаем его как главное
        if (devices.length === 0) {
          const newDeviceId = uuidv4()
          
          // Создаем первое устройство
          const deviceInfo: DeviceInfo = {
            id: newDeviceId,
            name: getBrowserInfo(),
            browser: navigator.userAgent,
            lastAccess: new Date().toLocaleString('ru'),
            timestamp: new Date().getTime()
          }
          
          // Добавляем устройство в список
          devices.push(deviceInfo)
          
          // Устанавливаем его как главное
          localStorage.setItem(MAIN_DEVICE_KEY, newDeviceId)
          setMainDeviceId(newDeviceId)
          
          // Сохраняем в localStorage
          localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices))
        } else if (devices.length > 0 && devices[0]?.id) {
          // Используем ID первого устройства как главного
          const firstDeviceId = devices[0].id
          localStorage.setItem(MAIN_DEVICE_KEY, firstDeviceId)
          setMainDeviceId(firstDeviceId)
        }
      }
      
      // Проверяем наличие экстренного устройства
      const emergencyDeviceId = localStorage.getItem('emergency-device-id')
      const emergencyDeviceInfo = localStorage.getItem('emergency-device-info')
      
      if (emergencyDeviceId && emergencyDeviceInfo) {
        try {
          console.log('Найдено экстренное устройство:', emergencyDeviceId);
          const deviceInfo = JSON.parse(emergencyDeviceInfo);
          
          // Проверяем, есть ли уже такое устройство в списке
          const exists = devices.some(d => d.id === emergencyDeviceId);
          
          if (!exists) {
            // Добавляем устройство в список
            devices.push({
              id: emergencyDeviceId,
              name: deviceInfo.name || getBrowserInfo(),
              browser: deviceInfo.browser || navigator.userAgent,
              lastAccess: deviceInfo.lastAccess || new Date().toLocaleString('ru'),
              timestamp: deviceInfo.timestamp || Date.now()
            });
            
            // Сохраняем обновленный список
            localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices));
            console.log('Экстренное устройство добавлено в список');
          }
        } catch (e) {
          console.error('Ошибка при обработке экстренного устройства:', e);
        }
      }
      
      // Проверяем, является ли текущее устройство "шаренным"
      const currentDeviceId = localStorage.getItem(CURRENT_DEVICE_KEY)
      let currentDeviceFound = false
      
      if (currentDeviceId) {
        setIsCurrentDeviceShared(true)
        
        // Проверяем, есть ли это устройство в списке авторизованных
        currentDeviceFound = devices.some(device => device.id === currentDeviceId)
        
        // Если устройство не найдено в списке, но ID есть в localStorage - добавляем
        if (!currentDeviceFound) {
          console.log('Текущее устройство не найдено в списке, добавляем:', currentDeviceId)
          
          // Пытаемся получить дополнительную информацию из дополнительного хранилища
          let extraInfo: any = {};
          try {
            const savedInfo = localStorage.getItem('current-device-info');
            if (savedInfo) {
              extraInfo = JSON.parse(savedInfo);
            }
          } catch (e) {
            console.error('Ошибка при чтении дополнительной информации:', e);
          }
          
          // Добавляем текущее устройство в список
          const deviceInfo: DeviceInfo = {
            id: currentDeviceId,
            name: extraInfo?.name || getBrowserInfo(),
            browser: extraInfo?.browser || navigator.userAgent,
            lastAccess: extraInfo?.lastAccess || new Date().toLocaleString('ru'),
            timestamp: extraInfo?.timestamp || Date.now()
          }
          
          // Добавляем в список устройств
          devices.push(deviceInfo)
          localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices))
        }
        
        // Шаренные устройства не могут авторизовать другие устройства
        setCanAuthorizeOthers(false)
      }
      
      // Проверка флага NFC-авторизации
      const isNfcAuth = localStorage.getItem('device-nfc-authorized') === 'true';
      if (isNfcAuth) {
        console.log('Устройство авторизовано через NFC/QR, ограничиваем доступ');
        setCanAuthorizeOthers(false);
      }
      
      // Фильтруем устаревшие устройства
      const currentTime = new Date().getTime();
      const validDevices = devices.filter(device => 
        (currentTime - device.timestamp) < MAX_DEVICE_LIFETIME
      );
      
      // Если мы удалили какие-то устройства, сохраняем обновленный список
      if (validDevices.length !== devices.length) {
        localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(validDevices));
      }
      
      // Устанавливаем список устройств и обновляем оставшееся количество слотов
      setAuthorizedDevices(validDevices)
      setRemainingSlots(MAX_DEVICES - validDevices.length)
      
    } catch (e) {
      console.error('Ошибка при загрузке данных об устройствах:', e)
    }
  }, [])
  
  // Сохранение списка устройств
  const saveDevices = useCallback((devices: DeviceInfo[]) => {
    try {
      localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices))
      setRemainingSlots(MAX_DEVICES - devices.length)
    } catch (e) {
      console.error('Ошибка при сохранении данных об устройствах:', e)
    }
  }, [])
  
  // Очистка всех устройств (для отладки)
  const clearAllDevices = useCallback(() => {
    try {
      localStorage.removeItem(DEVICES_STORAGE_KEY)
      localStorage.removeItem(CURRENT_DEVICE_KEY)
      localStorage.removeItem(MAIN_DEVICE_KEY)
      localStorage.removeItem('device-nfc-authorized')
      localStorage.removeItem('emergency-device-id')
      localStorage.removeItem('emergency-device-info')
      localStorage.removeItem('current-device-info')
      localStorage.removeItem('force-update-devices')
      localStorage.removeItem('last-auth-source')
      
      setAuthorizedDevices([])
      setRemainingSlots(MAX_DEVICES)
      setIsCurrentDeviceShared(false)
      setCanAuthorizeOthers(true)
      
      return true
    } catch (e) {
      console.error('Ошибка при очистке устройств:', e)
      return false
    }
  }, [])
  
  // Авторизация нового устройства
  const authorizeDevice = useCallback((iin: string, password: string): DeviceInfo | null => {
    // Проверяем, не превышен ли лимит устройств
    if (authorizedDevices.length >= MAX_DEVICES) {
      console.error('Достигнут максимальный лимит устройств (5)')
      return null
    }
    
    const now = new Date()
    const deviceId = uuidv4()
    
    // Создаем информацию об устройстве - ИСПРАВЛЕНО без isNFCAuthorized
    const deviceInfo: DeviceInfo = {
      id: deviceId,
      name: getBrowserInfo(),
      browser: navigator.userAgent,
      lastAccess: now.toLocaleString('ru'),
      timestamp: now.getTime()
    }
    
    // Добавляем устройство в список
    const updatedDevices = [...authorizedDevices, deviceInfo]
    setAuthorizedDevices(updatedDevices)
    saveDevices(updatedDevices)
    
    return deviceInfo
  }, [authorizedDevices, saveDevices])
  
  // Отзыв доступа для устройства
  const revokeDevice = useCallback((deviceId: string): boolean => {
    try {
      // Фильтруем список устройств, исключая устройство с указанным ID
      const updatedDevices = authorizedDevices.filter(device => device.id !== deviceId)
      
      // Если размер списка не изменился, значит устройство не найдено
      if (updatedDevices.length === authorizedDevices.length) {
        return false
      }
      
      // Обновляем список устройств
      setAuthorizedDevices(updatedDevices)
      saveDevices(updatedDevices)
      
      return true
    } catch (e) {
      console.error('Ошибка при отзыве доступа устройства:', e)
      return false
    }
  }, [authorizedDevices, saveDevices])
  
  // Подготовка данных для передачи через NFC
  const prepareAuthData = useCallback((): string => {
    try {
      // Запрещаем авторизацию с устройства, которое само было авторизовано через другое устройство
      if (isCurrentDeviceShared) {
        console.error('Нельзя авторизовать другие устройства с устройства, которое само было авторизовано')
        return ''
      }
      
      // Проверяем, не превышен ли лимит устройств
      if (authorizedDevices.length >= MAX_DEVICES) {
        console.error('Достигнут максимальный лимит устройств (5)')
        return 'limit_exceeded'
      }
      
      // Получаем данные из localStorage
      const iin = localStorage.getItem('user-iin')
      const password = localStorage.getItem('user-password')
      
      // Проверяем наличие данных
      if (!iin || !password) {
        console.error('Учетные данные не найдены в localStorage')
        
        // Если нет данных, используем хардкод для демонстрации
        if (process.env.NODE_ENV === 'development') {
          const testIin = '123456789012'
          const testPassword = 'password123'
          
          // Создаем временную информацию об устройстве без добавления в список авторизованных
          const deviceId = uuidv4()
          const tempDeviceInfo = {
            id: deviceId,
            name: getBrowserInfo(),
            browser: navigator.userAgent,
            lastAccess: new Date().toLocaleString('ru'),
            timestamp: new Date().getTime()
          }
          
          // Формируем тестовые данные для передачи
          const demoAuthData = {
            iin: testIin,
            password: testPassword,
            deviceId: deviceId,
            sourceDevice: {
              name: getBrowserInfo(),
              id: mainDeviceId || 'unknown'
            }
          }
          
          return JSON.stringify(demoAuthData)
        }
        
        return ''
      }
      
      // Создаем временный ID для нового устройства без добавления в список
      const deviceId = uuidv4()
      
      // Сохраняем информацию об устройстве-источнике
      const sourceDeviceInfo = {
        name: getBrowserInfo(),
        id: mainDeviceId || 'unknown'
      }
      
      // Формируем данные для передачи
      const authData = {
        iin, 
        password,
        deviceId,
        sourceDevice: sourceDeviceInfo
      }
      
      // Всегда сохраняем информацию об устройстве-источнике, не только в режиме разработки
      localStorage.setItem('last-auth-source', JSON.stringify({
        sourceDevice: sourceDeviceInfo
      }))
      
      // Возвращаем данные в JSON формате для более надежного распознавания
      return JSON.stringify(authData);
    } catch (e) {
      console.error('Ошибка при подготовке данных для авторизации:', e)
      return ''
    }
  }, [isCurrentDeviceShared, authorizedDevices.length, mainDeviceId])
  
  // Обновление времени последнего доступа для текущего устройства
  const updateCurrentDeviceTimestamp = useCallback(() => {
    try {
      const currentDeviceId = localStorage.getItem(CURRENT_DEVICE_KEY)
      if (currentDeviceId) {
        // Обновляем только если устройство найдено в списке
        const updatedDevices = authorizedDevices.map(device => {
          if (device.id === currentDeviceId) {
            const now = new Date()
            return {
              ...device,
              lastAccess: now.toLocaleString('ru'),
              timestamp: now.getTime()
            }
          }
          return device
        })
        
        setAuthorizedDevices(updatedDevices)
        saveDevices(updatedDevices)
      }
    } catch (e) {
      console.error('Ошибка при обновлении времени доступа:', e)
    }
  }, [authorizedDevices, saveDevices])
  
  // Обновляем время последнего доступа при активности пользователя
  useEffect(() => {
    if (isCurrentDeviceShared) {
      // Обновляем временную метку при загрузке и каждый час
      updateCurrentDeviceTimestamp()
      const intervalId = setInterval(updateCurrentDeviceTimestamp, 60 * 60 * 1000)
      
      return () => clearInterval(intervalId)
    }
  }, [isCurrentDeviceShared, updateCurrentDeviceTimestamp])
  
  return {
    authorizedDevices,
    authorizeDevice: canAuthorizeOthers ? authorizeDevice : ((): DeviceInfo | null => null),
    revokeDevice,
    prepareAuthData,
    isCurrentDeviceShared,
    canAuthorizeOthers,
    remainingSlots,
    clearAllDevices
  }
}

export default useDeviceAuth; 