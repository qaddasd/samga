import React from 'react'
import { metadata as baseMetadata } from '../layout'

export const metadata = {
  ...baseMetadata,
  title: 'Условия использования | SAMGA',
}

export default function TermsLayout({
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