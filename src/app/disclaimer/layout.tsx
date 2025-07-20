import React from 'react'
import { metadata as baseMetadata } from '../layout'

export const metadata = {
  ...baseMetadata,
  title: 'Правовая информация | SAMGA',
}

export default function DisclaimerLayout({
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