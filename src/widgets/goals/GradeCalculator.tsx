"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CalculatorIcon, RefreshCw } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const gradeConfig = {
  '5': 85,
  '4': 65,
  '3': 40,
  '2': 0
}

type SubjectScore = {
  current: number
  max: number
  target: number
  needed: number
  possible: boolean
}

const GradeCalculator = () => {
  const [formativeScore, setFormativeScore] = useState<SubjectScore>({
    current: 0,
    max: 25,
    target: 0,
    needed: 0,
    possible: false
  })
  
  const [summativeScore, setSummativeScore] = useState<SubjectScore>({
    current: 0,
    max: 25,
    target: 0,
    needed: 0,
    possible: false
  })
  
  const [examScore, setExamScore] = useState<SubjectScore>({
    current: 0,
    max: 50,
    target: 0,
    needed: 0,
    possible: false
  })
  
  const [targetGrade, setTargetGrade] = useState<keyof typeof gradeConfig>('5')
  const [targetPercentage, setTargetPercentage] = useState(gradeConfig[targetGrade])
  const [currentTotal, setCurrentTotal] = useState(0)
  const [targetPossible, setTargetPossible] = useState(false)
  
  useEffect(() => {
    calculateScores()
  }, [formativeScore.current, summativeScore.current, examScore.current, targetGrade])
  
  useEffect(() => {
    setTargetPercentage(gradeConfig[targetGrade])
  }, [targetGrade])
  
  const calculateScores = () => {
    // Calculate current total percentage
    const formativePercentage = formativeScore.max > 0 ? (formativeScore.current / formativeScore.max) * 25 : 0
    const summativePercentage = summativeScore.max > 0 ? (summativeScore.current / summativeScore.max) * 25 : 0
    const examPercentage = examScore.max > 0 ? (examScore.current / examScore.max) * 50 : 0
    
    const totalPercentage = formativePercentage + summativePercentage + examPercentage
    setCurrentTotal(parseFloat(totalPercentage.toFixed(2)))
    
    // Calculate needed score for formative
    const remainingPercentage = targetPercentage - summativePercentage - examPercentage
    const neededFormativePercentage = remainingPercentage > 25 ? 25 : remainingPercentage
    const neededFormativeScore = neededFormativePercentage / 25 * formativeScore.max
    
    // Update formative
    setFormativeScore(prev => ({
      ...prev,
      target: neededFormativePercentage,
      needed: Math.ceil(neededFormativeScore),
      possible: neededFormativeScore <= formativeScore.max
    }))
    
    // Calculate needed score for summative
    const remainingSummative = targetPercentage - formativePercentage - examPercentage
    const neededSummativePercentage = remainingSummative > 25 ? 25 : remainingSummative
    const neededSummativeScore = neededSummativePercentage / 25 * summativeScore.max
    
    // Update summative
    setSummativeScore(prev => ({
      ...prev,
      target: neededSummativePercentage,
      needed: Math.ceil(neededSummativeScore),
      possible: neededSummativeScore <= summativeScore.max
    }))
    
    // Calculate needed score for exam
    const remainingExam = targetPercentage - formativePercentage - summativePercentage
    const neededExamPercentage = remainingExam > 50 ? 50 : remainingExam
    const neededExamScore = neededExamPercentage / 50 * examScore.max
    
    // Update exam
    setExamScore(prev => ({
      ...prev,
      target: neededExamPercentage,
      needed: Math.ceil(neededExamScore),
      possible: neededExamScore <= examScore.max
    }))
    
    // Check if target is possible
    const isPossible = totalPercentage >= targetPercentage || 
      (formativeScore.possible && summativeScore.possible && examScore.possible)
    
    setTargetPossible(isPossible)
  }
  
  const resetForm = () => {
    setFormativeScore({
      current: 0,
      max: 25,
      target: 0,
      needed: 0,
      possible: false
    })
    
    setSummativeScore({
      current: 0,
      max: 25,
      target: 0,
      needed: 0,
      possible: false
    })
    
    setExamScore({
      current: 0,
      max: 50,
      target: 0,
      needed: 0,
      possible: false
    })
  }
  
  const handleInputChange = (
    type: 'formative' | 'summative' | 'exam',
    field: 'current' | 'max',
    value: string
  ) => {
    const numValue = value === '' ? 0 : Number(value)
    
    if (isNaN(numValue)) return
    
    switch(type) {
      case 'formative':
        setFormativeScore(prev => ({ ...prev, [field]: numValue }))
        break
      case 'summative':
        setSummativeScore(prev => ({ ...prev, [field]: numValue }))
        break
      case 'exam':
        setExamScore(prev => ({ ...prev, [field]: numValue }))
        break
    }
  }

  const handleFormativeSliderChange = (values: number[]) => {
    // Проверяем, что значение существует и является числом
    const value = values[0]
    if (typeof value === 'number') {
      setFormativeScore((prev) => ({
        ...prev,
        current: value
      }))
    }
  }
  
  const handleSummativeSliderChange = (values: number[]) => {
    // Проверяем, что значение существует и является числом
    const value = values[0]
    if (typeof value === 'number') {
      setSummativeScore((prev) => ({
        ...prev,
        current: value
      }))
    }
  }
  
  const handleExamSliderChange = (values: number[]) => {
    // Проверяем, что значение существует и является числом
    const value = values[0]
    if (typeof value === 'number') {
      setExamScore((prev) => ({
        ...prev,
        current: value
      }))
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalculatorIcon className="mr-2 h-5 w-5" /> 
            Расчет необходимых баллов
          </CardTitle>
          <CardDescription>
            Введите текущие баллы и выберите желаемую оценку
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scores" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scores">Ввод баллов</TabsTrigger>
              <TabsTrigger value="results">Результат</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scores" className="space-y-4">
              <div className="space-y-4 mt-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Label htmlFor="formative-current">Формативные баллы</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input 
                        id="formative-current" 
                        type="number" 
                        value={formativeScore.current || ''}
                        onChange={(e) => handleInputChange('formative', 'current', e.target.value)}
                        className="w-full" 
                      />
                      <span>/</span>
                      <Input 
                        id="formative-max" 
                        type="number" 
                        value={formativeScore.max || ''}
                        onChange={(e) => handleInputChange('formative', 'max', e.target.value)}
                        className="w-full" 
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label>Процент: {((formativeScore.current / formativeScore.max) * 100 || 0).toFixed(2)}%</Label>
                    <Slider 
                      value={[formativeScore.current]} 
                      max={formativeScore.max} 
                      step={1}
                      className="mt-2"
                      onValueChange={handleFormativeSliderChange} 
                    />
                  </div>
                </div>
                
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Label htmlFor="summative-current">Суммативные баллы (СОР)</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input 
                        id="summative-current" 
                        type="number" 
                        value={summativeScore.current || ''}
                        onChange={(e) => handleInputChange('summative', 'current', e.target.value)}
                        className="w-full" 
                      />
                      <span>/</span>
                      <Input 
                        id="summative-max" 
                        type="number" 
                        value={summativeScore.max || ''}
                        onChange={(e) => handleInputChange('summative', 'max', e.target.value)}
                        className="w-full" 
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label>Процент: {((summativeScore.current / summativeScore.max) * 100 || 0).toFixed(2)}%</Label>
                    <Slider 
                      value={[summativeScore.current]} 
                      max={summativeScore.max} 
                      step={1}
                      className="mt-2"
                      onValueChange={handleSummativeSliderChange} 
                    />
                  </div>
                </div>
                
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Label htmlFor="exam-current">Экзаменационные баллы (СОЧ)</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input 
                        id="exam-current" 
                        type="number" 
                        value={examScore.current || ''}
                        onChange={(e) => handleInputChange('exam', 'current', e.target.value)}
                        className="w-full" 
                      />
                      <span>/</span>
                      <Input 
                        id="exam-max" 
                        type="number" 
                        value={examScore.max || ''}
                        onChange={(e) => handleInputChange('exam', 'max', e.target.value)}
                        className="w-full" 
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label>Процент: {((examScore.current / examScore.max) * 100 || 0).toFixed(2)}%</Label>
                    <Slider 
                      value={[examScore.current]} 
                      max={examScore.max} 
                      step={1}
                      className="mt-2"
                      onValueChange={handleExamSliderChange} 
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <div className="flex-1">
                    <Label htmlFor="target-grade">Целевая оценка</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {Object.keys(gradeConfig).map(grade => (
                        <Button 
                          key={grade} 
                          type="button" 
                          variant={targetGrade === grade ? "default" : "outline"}
                          onClick={() => setTargetGrade(grade as keyof typeof gradeConfig)}
                          className="w-full"
                        >
                          {grade}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <Label>Текущий итог</Label>
                      <span className={`font-semibold text-lg ${currentTotal >= targetPercentage ? 'text-green-500' : 'text-orange-500'}`}>
                        {currentTotal}%
                      </span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <Label>Необходимо</Label>
                      <span className="font-semibold text-lg text-primary">
                        {targetPercentage}%
                      </span>
                    </div>
                    <Button 
                      onClick={resetForm} 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-4"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Сбросить
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-semibold text-lg mb-2">Текущий результат</h3>
                <p>Ваш текущий балл: <span className="font-semibold">{currentTotal}%</span></p>
                <p>Для оценки {targetGrade} нужно: <span className="font-semibold">{targetPercentage}%</span></p>
                <p className="mt-2">
                  {currentTotal >= targetPercentage 
                    ? <span className="text-green-500 font-semibold">Поздравляем! Вы уже достигли этой оценки!</span>
                    : <span className="text-orange-500 font-semibold">Необходимо набрать еще {(targetPercentage - currentTotal).toFixed(2)}%</span>
                  }
                </p>
              </div>
              
              <div className="space-y-4">
                <Card className="border border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Нужные формативные баллы</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <span>Текущие баллы:</span>
                      <span className="font-semibold">{formativeScore.current} / {formativeScore.max}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Нужно набрать:</span>
                      <span className={`font-semibold ${formativeScore.possible ? 'text-green-500' : 'text-red-500'}`}>
                        {formativeScore.needed > formativeScore.current ? formativeScore.needed : formativeScore.current} / {formativeScore.max}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Нужные суммативные баллы (СОР)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <span>Текущие баллы:</span>
                      <span className="font-semibold">{summativeScore.current} / {summativeScore.max}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Нужно набрать:</span>
                      <span className={`font-semibold ${summativeScore.possible ? 'text-green-500' : 'text-red-500'}`}>
                        {summativeScore.needed > summativeScore.current ? summativeScore.needed : summativeScore.current} / {summativeScore.max}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Нужные экзаменационные баллы (СОЧ)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <span>Текущие баллы:</span>
                      <span className="font-semibold">{examScore.current} / {examScore.max}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Нужно набрать:</span>
                      <span className={`font-semibold ${examScore.possible ? 'text-green-500' : 'text-red-500'}`}>
                        {examScore.needed > examScore.current ? examScore.needed : examScore.current} / {examScore.max}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="rounded-lg bg-muted p-4 mt-4">
                  <h3 className={`font-semibold ${targetPossible ? 'text-green-500' : 'text-red-500'}`}>
                    {targetPossible 
                      ? 'Оценка достижима!' 
                      : 'Оценка не достижима при текущих максимальных баллах'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {targetPossible 
                      ? 'Вы можете достичь этой оценки, если наберете указанные баллы.' 
                      : 'К сожалению, достичь этой оценки невозможно при текущих максимальных баллах. Попробуйте другую оценку или проверьте максимальные баллы.'}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default GradeCalculator 