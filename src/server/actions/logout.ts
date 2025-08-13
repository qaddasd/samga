'use server'

import { cookies } from 'next/headers'

export const logout = async () => {
  const cookiesStore = cookies()
  
  // Очищаем cookie при выходе (актуальные ключи)
  cookiesStore.delete('Access')
  cookiesStore.delete('Refresh')
  
  // Удаляем возможные старые ключи для совместимости
  cookiesStore.delete('samga-auth-token')
  cookiesStore.delete('samga-refresh-token')
  cookiesStore.delete('samga-city')
  
  return { success: true }
}
