import React from 'react'
import { metadata as baseMetadata } from '../layout'

export const metadata = {
  ...baseMetadata,
  title: 'Политика конфиденциальности | SAMGA',
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background min-h-screen">
      {children}
    </div>
  )
} 