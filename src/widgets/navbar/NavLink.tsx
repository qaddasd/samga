'use client'

import React, { FC } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

type NavLinkProps = {
  icon: React.ReactNode
  text: string
  href: string
  alternateHrefs?: string[]
}

const NavLink: FC<NavLinkProps> = ({ icon, text, href, alternateHrefs = [] }) => {
  const pathname = usePathname() || ''
  
  // Проверяем, активен ли текущий маршрут или его альтернативные пути
  const isActive = pathname.startsWith(href) || alternateHrefs.some(alt => pathname.startsWith(alt))

  return (
    <Link
      href={isActive ? '#' : href}
      className={`flex flex-col items-center justify-center text-center transition-colors w-1/4 hover:text-primary ${isActive ? 'text-primary hover:text-muted-foreground' : ''}`}
    >
      {icon}
      <span className={`leading-2 text-[13px] text-current sm:block mt-1`}>
        {text}
      </span>
    </Link>
  )
}

export default NavLink
