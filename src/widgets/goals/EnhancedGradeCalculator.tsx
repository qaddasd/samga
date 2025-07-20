"use client"

import React, { useState, useEffect } from 'react'
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { 
  Plus, Minus, Calculator, RefreshCw, CheckCircle, XCircle 
} from 'lucide-react'
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs'

// Пороговые значения для оценок
const GRADE_THRESHOLDS = {
  '5': 85,
  '4': 65,
  '3': 40,
  '2': 0
}

// Тип оцениваемой работы
type AssessmentType = 'summative' | 'exam'

// Структура для оценки
interface Assessment {
  id: string
  type: AssessmentType
  label: string
  currentMarks: number
  maxMarks: number
  weight: number  // Вес в процентах от типа
}

// Интерфейс для категории оценок
interface CategoryProps {
  assessments: Assessment[]
  type: AssessmentType
  label: string
  typeTotalWeight: number // Общий вес категории (50%)
  onAdd: () => void
  onRemove: (id: string) => void
  onChange: (id: string, field: 'currentMarks' | 'maxMarks', value: number) => void
}

// Компонент для отображения категории оценок (СОРы/СОЧи)
const AssessmentCategory = ({ 
  assessments, 
  type, 
  label, 
  typeTotalWeight,
  onAdd, 
  onRemove,
  onChange 
}: CategoryProps) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {label}
            <Badge variant="outline">
              {typeTotalWeight}%
            </Badge>
          </CardTitle>
          <Button onClick={onAdd} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" /> Добавить
          </Button>
        </div>
        <CardDescription>
          {type === 'summative' ? 'Суммативные оценки (СОР)' : 'Суммативные оценки за четверть (СОЧ)'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {assessments.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Нет оценок. Добавьте оценку, чтобы начать расчет.
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="flex items-center gap-2">
                <div className="flex-grow">
                  <Label className="mb-1 block">{assessment.label}</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={assessment.currentMarks || ''}
                      onChange={(e) => 
                        onChange(assessment.id, 'currentMarks', Number(e.target.value))
                      }
                      min={0}  
                      className="w-full"
                      placeholder="Баллы"
                    />
                    <span>/</span>
                    <Input
                      type="number"
                      value={assessment.maxMarks || ''}
                      onChange={(e) => 
                        onChange(assessment.id, 'maxMarks', Number(e.target.value))
                      }
                      min={1}
                      className="w-full"
                      placeholder="Макс."
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onRemove(assessment.id)}
                    >
                      <Minus className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Ключ для локального хранилища
const STORAGE_KEY = 'grade-calculator-data';

// Основной компонент калькулятора оценок
const EnhancedGradeCalculator = () => {
  // Состояния для разных типов оценок
  const [summativeAssessments, setSummativeAssessments] = useState<Assessment[]>([])
  const [examAssessments, setExamAssessments] = useState<Assessment[]>([])
  
  // Состояния для расчетов
  const [targetGrade, setTargetGrade] = useState<keyof typeof GRADE_THRESHOLDS>('5')
  const [currentPercentage, setCurrentPercentage] = useState(0)
  const [isAchievable, setIsAchievable] = useState(true)
  const [optimizedResults, setOptimizedResults] = useState<{
    assessmentId: string
    requiredMarks: number
    isPossible: boolean
  }[]>([])
  
  // Добавляем состояние для отслеживания расчета
  const [isCalculated, setIsCalculated] = useState(false)
  
  // Загружаем данные при монтировании компонента
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const data = JSON.parse(savedData);
      setSummativeAssessments(data.summative || []);
      setExamAssessments(data.exam || []);
      setTargetGrade(data.targetGrade || '5');
    }
  }, []);
  
  // Сохраняем данные при изменении состояния
  useEffect(() => {
    const dataToSave = {
      summative: summativeAssessments,
      exam: examAssessments,
      targetGrade
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [summativeAssessments, examAssessments, targetGrade]);
  
  // Расчет текущего процента
  useEffect(() => {
    calculateCurrentPercentage()
  }, [summativeAssessments, examAssessments])
  
  // Функция для расчета текущего процента
  const calculateCurrentPercentage = () => {
    // Расчет для СОРов (50%)
    const summativeTotal = calculateCategoryPercentage(summativeAssessments)
    const summativePercentage = summativeTotal * 0.5
    
    // Расчет для СОЧей (50%)
    const examTotal = calculateCategoryPercentage(examAssessments)
    const examPercentage = examTotal * 0.5
    
    // Общий процент
    const totalPercentage = summativePercentage + examPercentage
    setCurrentPercentage(Number(totalPercentage.toFixed(2)))
    
    // Проверяем, достижима ли цель
    const targetValue = GRADE_THRESHOLDS[targetGrade]
    setIsAchievable(totalPercentage >= targetValue)
  }
  
  // Расчет процента по категории
  const calculateCategoryPercentage = (assessments: Assessment[]): number => {
    if (assessments.length === 0) return 0
    
    const totalMax = assessments.reduce((sum, a) => sum + a.maxMarks, 0)
    if (totalMax === 0) return 0
    
    const totalCurrent = assessments.reduce((sum, a) => sum + a.currentMarks, 0)
    return (totalCurrent / totalMax) * 100
  }
  
  // Добавление новой оценки по типу
  const addAssessment = (type: AssessmentType) => {
    const newAssessment: Assessment = {
      id: `${type}-${Date.now()}`,
      type,
      label: getNextLabel(type),
      currentMarks: 0,
      maxMarks: type === 'exam' ? 40 : 20,
      weight: 0 // Будет рассчитано позже
    }
    
    if (type === 'summative') {
      setSummativeAssessments([...summativeAssessments, newAssessment])
    } else if (type === 'exam') {
      setExamAssessments([...examAssessments, newAssessment])
    }
  }
  
  // Получение следующей метки для новой оценки
  const getNextLabel = (type: AssessmentType): string => {
    if (type === 'summative') {
      return `СОР #${summativeAssessments.length + 1}`
    } else {
      return `СОЧ #${examAssessments.length + 1}`
    }
  }
  
  // Удаление оценки по идентификатору
  const removeAssessment = (id: string) => {
    const type = id.split('-')[0]
    
    if (type === 'summative') {
      setSummativeAssessments(summativeAssessments.filter(a => a.id !== id))
    } else if (type === 'exam') {
      setExamAssessments(examAssessments.filter(a => a.id !== id))
    }
  }
  
  // Изменение оценки
  const handleAssessmentChange = (
    id: string, 
    field: 'currentMarks' | 'maxMarks', 
    value: number
  ) => {
    const type = id.split('-')[0]
    
    if (type === 'summative') {
      setSummativeAssessments(summativeAssessments.map(a => 
        a.id === id ? { ...a, [field]: value } : a
      ))
    } else if (type === 'exam') {
      setExamAssessments(examAssessments.map(a => 
        a.id === id ? { ...a, [field]: value } : a
      ))
    }
  }
  
  // Сброс всех оценок
  const resetAll = () => {
    setSummativeAssessments([])
    setExamAssessments([])
    setOptimizedResults([])
    localStorage.removeItem(STORAGE_KEY)
  }
  
  // Оптимизация оценок для достижения целевой оценки
  const optimizeGrades = () => {
    const targetValue = GRADE_THRESHOLDS[targetGrade]
    const deficitPercentage = targetValue - currentPercentage
    
    if (deficitPercentage <= 0) {
      // Цель уже достигнута
      setOptimizedResults([])
      return
    }
    
    // Получаем все оценки, которые равны 0 (еще не получены)
    const allAssessments = [
      ...summativeAssessments, 
      ...examAssessments
    ].filter(a => a.currentMarks === 0)
    
    if (allAssessments.length === 0) {
      // Нет оценок для оптимизации
      setOptimizedResults([])
      return
    }

    // Получаем текущие данные по категориям
    const summativeTotalMax = summativeAssessments.reduce((sum, a) => sum + a.maxMarks, 0);
    const examTotalMax = examAssessments.reduce((sum, a) => sum + a.maxMarks, 0);
    
    const currentSummativeScore = summativeAssessments.reduce((sum, a) => sum + a.currentMarks, 0);
    const currentExamScore = examAssessments.filter(a => a.currentMarks === 0).reduce((sum, a) => sum + a.currentMarks, 0);
    
    // Текущие проценты по категориям
    const currentSummativePercent = summativeTotalMax > 0 ? 
      (currentSummativeScore / summativeTotalMax) * 100 : 0;
    const currentExamPercent = examTotalMax > 0 ? 
      (currentExamScore / examTotalMax) * 100 : 0;

    // Текущий вклад каждой категории в итоговый процент
    const currentSummativeContribution = currentSummativePercent * 0.5;
    const currentExamContribution = currentExamPercent * 0.5;

    // Осталось набрать до цели
    const targetDeficit = targetValue - (currentSummativeContribution + currentExamContribution);
    
    // Определяем, сколько можно получить из оставшихся оценок
    const emptySummatives = summativeAssessments.filter(a => a.currentMarks === 0);
    const emptyExams = examAssessments.filter(a => a.currentMarks === 0);
    
    // Максимальные доступные баллы для незаполненных оценок
    const remainingSummativeMax = emptySummatives.reduce((sum, a) => sum + a.maxMarks, 0);
    const remainingExamMax = emptyExams.reduce((sum, a) => sum + a.maxMarks, 0);
    
    // Максимально возможный процент по каждой категории
    const maxPossibleSummativePercent = summativeTotalMax > 0 ? 
      ((currentSummativeScore + remainingSummativeMax) / summativeTotalMax) * 100 : 0;
    const maxPossibleExamPercent = examTotalMax > 0 ? 
      ((currentExamScore + remainingExamMax) / examTotalMax) * 100 : 0;
    
    // Максимально возможный вклад каждой категории в итоговый процент
    const maxPossibleSummativeContribution = maxPossibleSummativePercent * 0.5;
    const maxPossibleExamContribution = maxPossibleExamPercent * 0.5;
    
    // Общий максимально возможный процент
    const maxPossibleTotal = maxPossibleSummativeContribution + maxPossibleExamContribution;
    
    // Проверяем, достижима ли цель
    const isAchievable = maxPossibleTotal >= targetValue;
    setIsAchievable(isAchievable);
    
    if (!isAchievable) {
      // Если цель недостижима, заполняем все оценки максимальными значениями
      const results = allAssessments.map(a => ({
        assessmentId: a.id,
        requiredMarks: a.maxMarks,
        isPossible: false
      }));
      
      setOptimizedResults(results);
      
      // Заполняем поля максимальными значениями
      const updatedSummativeAssessments = [...summativeAssessments].map(a => 
        a.currentMarks === 0 ? { ...a, currentMarks: a.maxMarks } : a
      );
      
      const updatedExamAssessments = [...examAssessments].map(a => 
        a.currentMarks === 0 ? { ...a, currentMarks: a.maxMarks } : a
      );
      
      setSummativeAssessments(updatedSummativeAssessments);
      setExamAssessments(updatedExamAssessments);
      return;
    }
    
    // Если цель достижима, распределяем баллы оптимально
    
    // Стратегия: распределяем дефицит поровну между категориями
    // и внутри каждой категории распределяем по оценкам пропорционально их максимальным баллам
    
    // Дефицит для распределения между категориями
    let summativeDeficit = targetDeficit / 2;
    let examDeficit = targetDeficit / 2;
    
    // Если в какой-то категории нельзя набрать нужное количество баллов, перераспределяем
    const maxAdditionalSummativeContribution = maxPossibleSummativeContribution - currentSummativeContribution;
    const maxAdditionalExamContribution = maxPossibleExamContribution - currentExamContribution;
    
    if (summativeDeficit > maxAdditionalSummativeContribution) {
      // В СОРах нельзя набрать столько, сколько нужно
      const shortfall = summativeDeficit - maxAdditionalSummativeContribution;
      summativeDeficit = maxAdditionalSummativeContribution;
      examDeficit += shortfall;
      
      // Проверяем, можно ли в СОЧах набрать больше
      if (examDeficit > maxAdditionalExamContribution) {
        examDeficit = maxAdditionalExamContribution;
        // Цель недостижима, но мы уже проверили это выше
      }
    } else if (examDeficit > maxAdditionalExamContribution) {
      // В СОЧах нельзя набрать столько, сколько нужно
      const shortfall = examDeficit - maxAdditionalExamContribution;
      examDeficit = maxAdditionalExamContribution;
      summativeDeficit += shortfall;
      
      // Проверяем, можно ли в СОРах набрать больше
      if (summativeDeficit > maxAdditionalSummativeContribution) {
        summativeDeficit = maxAdditionalSummativeContribution;
        // Цель недостижима, но мы уже проверили это выше
      }
    }
    
    // Теперь распределяем баллы внутри категорий
    
    // Для СОРов
    const summativeResults: { id: string, marks: number }[] = [];
    if (emptySummatives.length > 0 && summativeTotalMax > 0) {
      // Сколько процентов нужно добрать в этой категории
      const neededPercentage = (summativeDeficit / 0.5) * 100;
      
      // Сколько баллов нужно набрать всего
      const totalPointsNeeded = Math.ceil((neededPercentage * summativeTotalMax) / 100);
      
      // Сортируем оценки по максимальному баллу (в порядке убывания)
      const sortedAssessments = [...emptySummatives].sort((a, b) => b.maxMarks - a.maxMarks);
      
      // Распределяем баллы пропорционально максимальному баллу каждой оценки
      const totalMaxMarks = sortedAssessments.reduce((sum, a) => sum + a.maxMarks, 0);
      
      let remainingPoints = totalPointsNeeded;
      
      for (const assessment of sortedAssessments) {
        // Сколько баллов приходится на эту оценку
        const proportion = assessment.maxMarks / totalMaxMarks;
        const pointsForThis = Math.min(
          assessment.maxMarks,
          Math.ceil(totalPointsNeeded * proportion)
        );
        
        summativeResults.push({
          id: assessment.id,
          marks: pointsForThis
        });
        
        remainingPoints -= pointsForThis;
      }
      
      // Если остались нераспределенные баллы, добавляем их к первым оценкам
      let index = 0;
      while (remainingPoints > 0 && sortedAssessments.length > 0) {
        const assessment = sortedAssessments[index];
        const resultIndex = summativeResults.findIndex(r => r.id === assessment.id);
        
        if (resultIndex !== -1 && summativeResults[resultIndex].marks < assessment.maxMarks) {
          summativeResults[resultIndex].marks += 1;
          remainingPoints -= 1;
        }
        
        index = (index + 1) % sortedAssessments.length;
      }
    }
    
    // Для СОЧей (аналогично)
    const examResults: { id: string, marks: number }[] = [];
    if (emptyExams.length > 0 && examTotalMax > 0) {
      // Сколько процентов нужно добрать в этой категории
      const neededPercentage = (examDeficit / 0.5) * 100;
      
      // Сколько баллов нужно набрать всего
      const totalPointsNeeded = Math.ceil((neededPercentage * examTotalMax) / 100);
      
      // Сортируем оценки по максимальному баллу (в порядке убывания)
      const sortedAssessments = [...emptyExams].sort((a, b) => b.maxMarks - a.maxMarks);
      
      // Распределяем баллы пропорционально максимальному баллу каждой оценки
      const totalMaxMarks = sortedAssessments.reduce((sum, a) => sum + a.maxMarks, 0);
      
      let remainingPoints = totalPointsNeeded;
      
      for (const assessment of sortedAssessments) {
        // Сколько баллов приходится на эту оценку
        const proportion = assessment.maxMarks / totalMaxMarks;
        const pointsForThis = Math.min(
          assessment.maxMarks,
          Math.ceil(totalPointsNeeded * proportion)
        );
        
        examResults.push({
          id: assessment.id,
          marks: pointsForThis
        });
        
        remainingPoints -= pointsForThis;
      }
      
      // Если остались нераспределенные баллы, добавляем их к первым оценкам
      let index = 0;
      while (remainingPoints > 0 && sortedAssessments.length > 0) {
        const assessment = sortedAssessments[index];
        const resultIndex = examResults.findIndex(r => r.id === assessment.id);
        
        if (resultIndex !== -1 && examResults[resultIndex].marks < assessment.maxMarks) {
          examResults[resultIndex].marks += 1;
          remainingPoints -= 1;
        }
        
        index = (index + 1) % sortedAssessments.length;
      }
    }
    
    // Объединяем результаты
    const combinedResults = [
      ...summativeResults.map(r => ({
        assessmentId: r.id,
        requiredMarks: r.marks,
        isPossible: true
      })),
      ...examResults.map(r => ({
        assessmentId: r.id,
        requiredMarks: r.marks,
        isPossible: true
      }))
    ];
    
    setOptimizedResults(combinedResults);
    
    // Автоматически заполняем пустые поля с рассчитанными значениями
    const updatedSummativeAssessments = [...summativeAssessments].map(assessment => {
      if (assessment.currentMarks === 0) {
        const result = summativeResults.find(r => r.id === assessment.id);
        if (result) {
          return {
            ...assessment,
            currentMarks: result.marks
          };
        }
      }
      return assessment;
    });
    
    const updatedExamAssessments = [...examAssessments].map(assessment => {
      if (assessment.currentMarks === 0) {
        const result = examResults.find(r => r.id === assessment.id);
        if (result) {
          return {
            ...assessment,
            currentMarks: result.marks
          };
        }
      }
      return assessment;
    });
    
    // Обновляем состояния оценок с заполненными значениями
    setSummativeAssessments(updatedSummativeAssessments);
    setExamAssessments(updatedExamAssessments);
  }
  
  // Поиск оптимизированного результата для оценки
  const getOptimizedResult = (id: string) => {
    return optimizedResults.find(r => r.assessmentId === id)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Калькулятор оценок
          </CardTitle>
          <CardDescription>
            Добавляйте оценки и рассчитывайте необходимые баллы для достижения желаемой оценки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="input" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Ввод оценок</TabsTrigger>
              <TabsTrigger value="result">Результат</TabsTrigger>
            </TabsList>
            
            <TabsContent value="input" className="space-y-4">
              <AssessmentCategory
                assessments={summativeAssessments}
                type="summative"
                label="СОРы"
                typeTotalWeight={50}
                onAdd={() => addAssessment('summative')}
                onRemove={removeAssessment}
                onChange={handleAssessmentChange}
              />
              
              <AssessmentCategory
                assessments={examAssessments}
                type="exam"
                label="СОЧи"
                typeTotalWeight={50}
                onAdd={() => addAssessment('exam')}
                onRemove={removeAssessment}
                onChange={handleAssessmentChange}
              />
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex-1">
                  <Label htmlFor="target-grade">Целевая оценка</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {Object.keys(GRADE_THRESHOLDS).map(grade => (
                      <Button 
                        key={grade} 
                        type="button" 
                        variant={targetGrade === grade ? "default" : "outline"}
                        onClick={() => setTargetGrade(grade as keyof typeof GRADE_THRESHOLDS)}
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
                    <span className={`font-semibold text-lg ${
                      currentPercentage >= GRADE_THRESHOLDS[targetGrade] 
                        ? 'text-green-500' 
                        : 'text-orange-500'
                    }`}>
                      {currentPercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <Label>Необходимо</Label>
                    <span className="font-semibold text-lg text-primary">
                      {GRADE_THRESHOLDS[targetGrade]}%
                    </span>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={() => {
                        optimizeGrades();
                        setIsCalculated(true);
                      }} 
                      variant="default" 
                      className="w-full"
                    >
                      <Calculator className="mr-2 h-4 w-4" /> Рассчитать
                    </Button>
                    <Button 
                      onClick={() => {
                        resetAll();
                        setIsCalculated(false);
                      }} 
                      variant="outline" 
                      className="w-full"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Сбросить
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="result" className="space-y-6">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-semibold text-lg mb-2">Текущий результат</h3>
                <p>Ваш текущий балл: <span className="font-semibold">{currentPercentage}%</span></p>
                <p>Для оценки {targetGrade} нужно: <span className="font-semibold">{GRADE_THRESHOLDS[targetGrade]}%</span></p>
                <p className="mt-2">
                  {currentPercentage >= GRADE_THRESHOLDS[targetGrade]
                    ? <span className="text-green-500 font-semibold">Поздравляем! Вы уже достигли этой оценки!</span>
                    : <span className="text-orange-500 font-semibold">
                        Необходимо набрать еще {(GRADE_THRESHOLDS[targetGrade] - currentPercentage).toFixed(2)}%
                      </span>
                  }
                </p>
              </div>
              
              {optimizedResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Рекомендуемые баллы для достижения оценки {targetGrade}</h3>
                  
                  {/* СОРы */}
                  {summativeAssessments.some(a => a.currentMarks === 0) && (
                    <Accordion type="single" collapsible className="border rounded-md" defaultValue="summative">
                      <AccordionItem value="summative">
                        <AccordionTrigger className="px-4 py-2">СОРы</AccordionTrigger>
                        <AccordionContent className="px-4">
                          {summativeAssessments
                            .filter(a => a.currentMarks === 0)
                            .map(assessment => {
                              const result = getOptimizedResult(assessment.id)
                              return (
                                <div key={assessment.id} className="py-2 flex justify-between items-center">
                                  <span>{assessment.label}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-semibold ${
                                      result?.isPossible ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                      {result ? `${result.requiredMarks} / ${assessment.maxMarks}` : '-'}
                                    </span>
                                    {result?.isPossible ? 
                                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    }
                                  </div>
                                </div>
                              )
                            })
                          }
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                  
                  {/* СОЧи */}
                  {examAssessments.some(a => a.currentMarks === 0) && (
                    <Accordion type="single" collapsible className="border rounded-md" defaultValue="exam">
                      <AccordionItem value="exam">
                        <AccordionTrigger className="px-4 py-2">СОЧи</AccordionTrigger>
                        <AccordionContent className="px-4">
                          {examAssessments
                            .filter(a => a.currentMarks === 0)
                            .map(assessment => {
                              const result = getOptimizedResult(assessment.id)
                              return (
                                <div key={assessment.id} className="py-2 flex justify-between items-center">
                                  <span>{assessment.label}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-semibold ${
                                      result?.isPossible ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                      {result ? `${result.requiredMarks} / ${assessment.maxMarks}` : '-'}
                                    </span>
                                    {result?.isPossible ? 
                                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    }
                                  </div>
                                </div>
                              )
                            })
                          }
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                  
                  <div className="rounded-lg bg-muted p-4 mt-4">
                    <h3 className={`font-semibold ${isAchievable ? 'text-green-500' : 'text-red-500'}`}>
                      {isAchievable 
                        ? 'Оценка достижима!' 
                        : 'Оценка не достижима при текущих максимальных баллах'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isAchievable 
                        ? 'Вы можете достичь этой оценки, если наберете указанные баллы.' 
                        : 'К сожалению, достичь этой оценки невозможно при текущих максимальных баллах. Попробуйте другую оценку или проверьте максимальные баллы.'}
                    </p>
                  </div>
                </div>
              )}
              
              {optimizedResults.length === 0 && currentPercentage < GRADE_THRESHOLDS[targetGrade] && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Нажмите "Рассчитать" на вкладке "Ввод оценок", 
                    чтобы получить рекомендации по необходимым баллам.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Показываем сообщение после расчета */}
          {isCalculated && (
            <div className="mt-4 p-2 bg-green-50 text-green-700 rounded-md text-sm">
              Расчет выполнен! Пустые поля заполнены оптимальными значениями для достижения оценки {targetGrade}.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedGradeCalculator 