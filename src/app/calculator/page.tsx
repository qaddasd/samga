'use client'

import React, { useEffect, useState } from 'react'
import EnhancedGradeCalculator from '@/widgets/goals/EnhancedGradeCalculator'

const CalculatorPage = () => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
  }, [])
  
  return (
    <div 
      className="flex flex-col"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 mb-6">
        Расчет баллов
      </h1>
      
      <EnhancedGradeCalculator />
    </div>
  )
}

export default CalculatorPage 