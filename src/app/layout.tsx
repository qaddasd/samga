import 'server-only'
// import { Analytics } from '@/components/Analytics'
// import './globals.css'
import { Inter as FontSans } from 'next/font/google'
import { cn } from '@/lib/utils'
// import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/lib/providers/ThemeProvider'
// import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'
import { Metadata } from 'next'
import React, { PropsWithChildren } from 'react'

import '@/app/globals.scss'
import IconProvider from '@/lib/providers/IconProvider'
import ProgressProvider from '@/lib/providers/ProgressProvider'
import QueryProvider from '@/lib/providers/QueryProvider'
import ToastProvider from '@/lib/providers/ToastProvider'
import NotificationProvider from '@/lib/providers/NotificationProvider'
import OneSignalProvider from '@/lib/providers/OneSignalProvider'
import PreloadPages from '@/components/misc/PreloadPages'
// import { env } from '@/env.mjs'
// import { siteConfig } from '@/config/site'

const fontSans = FontSans({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'samga.nis 2.4 — Электронный дневник НИШ с быстрым переходом',
  description:
    'samga.nis 2.4 — электронный дневник для школьников НИШ. Оценки и уведомления в одном месте. Современный интерфейс, быстрый доступ.',
  keywords:
    'samga.nis, samga, электронный дневник, ниш, nis, дневник, электронный журнал, школа, оценки, задания, уведомления, 2.4',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: [
    { rel: 'icon', url: '/favicon.ico', type: 'image/x-icon' },
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    { rel: 'icon', url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
    { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#3498db' },
    { rel: 'shortcut icon', url: '/favicon.ico', type: 'image/x-icon' },
  ],
  manifest: '/site.webmanifest',
  appleWebApp: {
    title: 'samga.nis 2.4',
    statusBarStyle: 'black-translucent',
    capable: true,
    startupImage: ['/apple-icon-180.png'],
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://samga.top/',
    title: 'samga.nis 2.4 — Электронный дневник НИШ',
    description:
      'samga.nis 2.4 — электронный дневник для школьников. Оценки и уведомления в одном месте.',
    siteName: 'samga.nis 2.4 — Электронный дневник',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'samga.nis 2.4 — Электронный дневник НИШ',
    description:
      'samga.nis 2.4 — электронный дневник для школьников. Оценки и уведомления в одном месте.',
  },
  alternates: {
    canonical: 'https://samga.top/',
  },
}

export const viewport = {
  themeColor: '#3498db',
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <Script id="onesignal-sdk" src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" strategy="lazyOnload" />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "63f33c82-9b33-49f6-8c52-56488c84adda",
              });
            });
          `}
        </Script>
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
        )}
      >
        <div
          vaul-drawer-wrapper=""
          className={cn(
            'min-h-screen bg-background font-sans antialiased',
            fontSans.variable,
          )}
        >
          <ProgressProvider>
            <QueryProvider>
              <ThemeProvider>
                <IconProvider>
                  <ToastProvider>
                    <OneSignalProvider oneSignalAppId="63f33c82-9b33-49f6-8c52-56488c84adda">
                      <NotificationProvider>
                    <PreloadPages />
                    {children}
                      </NotificationProvider>
                    </OneSignalProvider>
                  </ToastProvider>
                </IconProvider>
              </ThemeProvider>
            </QueryProvider>
          </ProgressProvider>
        </div>
      </body>
    </html>
  )
}
