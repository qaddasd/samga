'use server'

interface SignInParams {
  iin: string
  password: string
}

interface SignInResult {
  success: boolean
  error?: string
}

export async function signIn(params: SignInParams): Promise<SignInResult> {
  try {
    // Имитация успешного входа
    return {
      success: true
    }
  } catch (error) {
    console.error('Ошибка входа:', error)
    return {
      success: false,
      error: 'Произошла ошибка при входе'
    }
  }
} 