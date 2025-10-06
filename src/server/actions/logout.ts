'use server'

import { cookies } from 'next/headers'

export const logout = async () => {
  const cookiesStore = cookies()
  
  // Очищаем cookie при выходе
  cookiesStore.delete('samga-auth-token')
  cookiesStore.delete('samga-refresh-token')
  cookiesStore.delete('samga-city')
  
  return { success: true }
}
