'use client'

import React, { createContext, useState, useContext, useCallback, FC, PropsWithChildren, useEffect } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { checkNotificationPermission, sendGradeNotification, subscribeToGradeNotifications } from '../utils/notifications'
import OneSignal from 'react-onesignal'

interface NotificationContextProps {
  redirectToGrade: (subject: string) => void
  sendPushNotification: (title: string, message: string, url?: string) => Promise<void>
  checkForUpdates: () => Promise<void>
  subscribeToNotifications: () => Promise<boolean>
  notificationsEnabled: boolean
}

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  renotify?: boolean;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter()
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false)
  
  // Function to redirect to grade page instead of showing notification
  const redirectToGrade = useCallback((subject: string) => {
    // Play notification sound if available
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.5
      audio.play().catch(e => console.error('Failed to play notification sound:', e))
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
    
    // Redirect to the relevant page
    router.push('/grades')
  }, [router])
  
  // Check OneSignal notification permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const isEnabled = await checkNotificationPermission()
      setNotificationsEnabled(isEnabled)
      
      // Setup OneSignal event listeners
      if (typeof window !== 'undefined') {
        // Listen for permission changes
        window.addEventListener('oneSignalPermissionChange', async () => {
          const newPermission = await checkNotificationPermission()
          setNotificationsEnabled(newPermission)
        })
        
        // Listen for notification display events
        window.addEventListener('oneSignalNotificationDisplay', (event: any) => {
          console.log('OneSignal notification displayed:', event.detail)
        })
        
        // Listen for notification click events
        window.addEventListener('oneSignalNotificationClick', (event: any) => {
          console.log('OneSignal notification clicked:', event.detail)
          
          if (event.detail?.data?.url) {
            router.push(event.detail.data.url)
          }
        })
      }
    }
    
    checkPermission()
    
    return () => {
      // Cleanup event listeners
      if (typeof window !== 'undefined') {
        window.removeEventListener('oneSignalPermissionChange', () => {})
        window.removeEventListener('oneSignalNotificationDisplay', () => {})
        window.removeEventListener('oneSignalNotificationClick', () => {})
      }
    }
  }, [router])
  
  // Initialize user for notifications after login
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (userId && notificationsEnabled) {
      // Set external user ID to target this specific user
      try {
        (OneSignal as any).setExternalUserId(userId)
        subscribeToGradeNotifications()
      } catch (error) {
        console.error('Failed to set OneSignal user ID:', error)
      }
    }
  }, [notificationsEnabled])
  
  // Subscribe to notifications
  const subscribeToNotifications = useCallback(async () => {
    try {
      // Request permission
      await (OneSignal as any).showNativePrompt()
      
      // Check if permission was granted
      const permission = await checkNotificationPermission()
      setNotificationsEnabled(permission)
      
      // If granted, subscribe to grade notifications
      if (permission) {
        await subscribeToGradeNotifications()
      }
      
      return permission
    } catch (error) {
      console.error('Error subscribing to notifications:', error)
      return false
    }
  }, [])
  
  // Function to send push notification
  const sendPushNotification = useCallback(async (title: string, message: string, url?: string) => {
    // Play notification sound if in-app
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.5
      audio.play().catch(e => console.error('Failed to play notification sound:', e))
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
    
    // Use OneSignal for push notifications
    if (notificationsEnabled) {
      try {
        const userId = localStorage.getItem('userId')
        if (userId) {
          // For grade notifications specifically
          if (title.includes('оценка')) {
            const subject = title.replace('Новая оценка по предмету: ', '')
            const grade = message.replace('Поставлена оценка: ', '')
            
            await sendGradeNotification(userId, subject, grade)
          } else {
            // For general notifications
            await (OneSignal as any).sendSelfNotification(
              title,
              message,
              url || '/',
              {},
              [userId]
            )
          }
        } else {
          console.warn('Cannot send notification: no user ID found')
        }
      } catch (error) {
        console.error('Error sending OneSignal notification:', error)
        
        // Fallback to browser notification
        showBrowserNotification(title, message, url)
      }
    } else {
      // Fallback to browser notification
      showBrowserNotification(title, message, url)
    }
  }, [notificationsEnabled])
  
  // Fallback browser notification function
  const showBrowserNotification = (title: string, message: string, url?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const options: ExtendedNotificationOptions = {
          body: message,
          icon: '/apple-touch-icon.png',
          badge: '/favicon-32x32.png',
          tag: 'samga-notification',
          data: { url: url || '/grades' },
          requireInteraction: true,
        }
        
        const notification = new Notification(title, options)
        
        notification.onclick = () => {
          window.focus()
          if (url) {
            router.push(url)
          }
          notification.close()
        }
      } catch (error) {
        console.error('Error showing notification:', error)
      }
    }
  }
  
  // For future implementation: check for grade updates periodically
  const checkForUpdates = useCallback(async () => {
    // This function would be implemented to check for updates from the server
    // For now, just a placeholder that will be implemented with actual API calls later
    try {
      // Mock implementation - in real app would fetch from API
      console.log('Checking for updates...')
      
      // For demo purposes, show a notification after a random delay
      if (Math.random() > 0.8) {
        setTimeout(() => {
          const subjects = ['Математика', 'Физика', 'Химия', 'История', 'Английский язык']
          const grades = ['10/10', '9/10', '8/10', '7/10', '5/10']
          const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
          const randomGrade = grades[Math.floor(Math.random() * grades.length)]
          
          const title = `Новая оценка по предмету: ${randomSubject}`
          const message = `Поставлена оценка: ${randomGrade}`
          
          // Send notification to all platforms
          sendPushNotification(title, message, '/grades')
        }, Math.random() * 10000)
      }
      
    } catch (error) {
      console.error('Error checking for updates:', error)
    }
  }, [sendPushNotification])
  
  // Check for updates periodically when user is logged in
  useEffect(() => {
    // Only check for updates if user is logged in (could check token/session)
    const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('user-iin')
    
    if (isLoggedIn) {
      // Initial check
      checkForUpdates()
      
      // Set up interval to check regularly
      const intervalId = setInterval(() => {
        checkForUpdates()
      }, 60000) // Check every minute
      
      return () => clearInterval(intervalId)
    }
  }, [checkForUpdates])

  return (
    <NotificationContext.Provider 
      value={{ 
        redirectToGrade, 
        sendPushNotification, 
        checkForUpdates, 
        subscribeToNotifications,
        notificationsEnabled
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationProvider 