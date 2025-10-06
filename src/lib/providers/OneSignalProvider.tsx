'use client'

import React, { useEffect, FC, PropsWithChildren } from 'react'
import OneSignal from 'react-onesignal'

interface OneSignalProviderProps {
  oneSignalAppId?: string
}

// Default OneSignal App ID - replace with your own in production
const DEFAULT_APP_ID = '00000000-0000-0000-0000-000000000000'

export const OneSignalProvider: FC<PropsWithChildren<OneSignalProviderProps>> = ({ 
  children,
  oneSignalAppId = '63f33c82-9b33-49f6-8c52-56488c84adda'
}) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initOneSignal()
    }
  }, [])
  
  const initOneSignal = async () => {
    try {
      await OneSignal.init({
        appId: oneSignalAppId,
        allowLocalhostAsSecureOrigin: true,
        safari_web_id: "web.onesignal.auto.0c986762-c763-4187-98ed-40f4f7c8ac63"
      });
      
      // Set up individualized user identification when logged in
      const setupUserIdentification = () => {
        const userId = localStorage.getItem('userId');
        if (userId) {
          // Set external user ID for OneSignal to target individual users
          // Using any type assertion to handle typing issues
          (OneSignal as any).setExternalUserId(userId);
          
          // Add user-specific tags for targeted notifications
          // Using any type assertion to handle typing issues
          (OneSignal as any).sendTags({
            user_id: userId,
            user_type: localStorage.getItem('userRole') || 'student'
          });
        }
      };
      
      // Set up immediately if user is logged in
      setupUserIdentification();
      
      // Listen for login events to set up user identification
      window.addEventListener('user-logged-in', () => {
        setupUserIdentification();
      });
      
      console.log('OneSignal initialized successfully');
      
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
    }
  }

  return <>{children}</>
}

export default OneSignalProvider 