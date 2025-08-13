'use client'

import React, { PropsWithChildren, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const PageTransition: React.FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(false)
    
    const timeout = setTimeout(() => {
      setIsVisible(true)
    }, 50)
    
    return () => clearTimeout(timeout)
  }, [pathname])

  return (
    <div 
      key={pathname} 
      className={`transform transition-all duration-500 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  )
}

export default PageTransition 