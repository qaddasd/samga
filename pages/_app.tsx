import type { AppProps } from 'next/app'
import '@/app/globals.scss'
 
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
} 