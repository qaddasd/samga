'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow
} from '@/components/ui/table'
import { 
  getSubjects, getSubject, calculateSubjectResult, calculateRequiredMarks,
  SubjectItem, SubjectDetail, Assessment
} from '@/lib/services/subjectService'

interface AssessmentWithRequiredMarks extends Assessment {
  requiredMarks?: number
  isPossible?: boolean
}

const SubjectGradeCalculator = () => {
  const [subjects, setSubjects] = useState<SubjectItem[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [subjectDetails, setSubjectDetails] = useState<SubjectDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [targetGrade, setTargetGrade] = useState<'5' | '4' | '3' | '2'>('5')
  const [assessmentsWithMarks, setAssessmentsWithMarks] = useState<AssessmentWithRequiredMarks[]>([])
  const [result, setResult] = useState<{
    currentPercentage: number;
    requiredPercentage: number;
    possible: boolean;
  } | null>(null)
  
  // Загрузка списка предметов при монтировании компонента
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await getSubjects()
        setSubjects(data)
      } catch (err) {
        setError('Не удалось загрузить список предметов')
        console.error(err)
      }
    }
    
    loadSubjects()
  }, [])
  
  // Загрузка деталей предмета при выборе
  useEffect(() => {
    if (!selectedSubject) return
    
    const loadSubjectDetails = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const data = await getSubject(selectedSubject)
        setSubjectDetails(data)
        if (data) {
          setAssessmentsWithMarks(data.assessments)
        }
      } catch (err) {
        setError(`Не удалось загрузить информацию о предмете ${selectedSubject}`)
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSubjectDetails()
  }, [selectedSubject])
  
  // Расчет необходимых баллов при изменении целевой оценки или деталей предмета
  useEffect(() => {
    if (!subjectDetails || !assessmentsWithMarks.length) return
    
    const calculation = calculateRequiredMarks(assessmentsWithMarks, targetGrade)
    
    // Обновляем assessmentsWithMarks с необходимыми баллами
    const updatedAssessments = assessmentsWithMarks.map(assessment => {
      const matchingAssessment = calculation.remainingAssessments.find(
        item => item.assessment.id === assessment.id
      )
      
      if (matchingAssessment) {
        return {
          ...assessment,
          requiredMarks: matchingAssessment.requiredMarks,
          isPossible: matchingAssessment.possible
        }
      }
      
      return assessment
    })
    
    setAssessmentsWithMarks(updatedAssessments)
    setResult({
      currentPercentage: calculation.currentPercentage,
      requiredPercentage: calculation.requiredPercentage,
      possible: calculation.possible
    })
  }, [subjectDetails, targetGrade, assessmentsWithMarks.length])
  
  // Обработчик изменения оценки пользователя
  const handleUserMarksChange = (id: string, value: string) => {
    const numValue = value === '' ? null : Number(value)
    
    setAssessmentsWithMarks(prevAssessments => 
      prevAssessments.map(assessment => 
        assessment.id === id ? { ...assessment, userMarks: numValue } : assessment
      )
    )
  }
  
  return (
    <div className="flex flex-col space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Выберите предмет</CardTitle>
          <CardDescription>
            Выберите предмет для расчета необходимых баллов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="subject">Предмет</Label>
              <Select
                onValueChange={value => setSelectedSubject(value)}
                value={selectedSubject || undefined}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Выберите предмет" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedSubject && subjectDetails && (
              <div className="flex flex-col space-y-1.5">
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">Преподаватель</p>
                    <p className="text-sm text-muted-foreground">
                      {subjectDetails.teacher}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="targetGrade">Целевая оценка:</Label>
                    <Select
                      onValueChange={(value) => 
                        setTargetGrade(value as '5' | '4' | '3' | '2')
                      }
                      value={targetGrade}
                    >
                      <SelectTrigger id="targetGrade" className="w-[80px]">
                        <SelectValue placeholder="5" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {result && (
                  <Card className="bg-muted">
                    <CardContent className="pt-4">
                      <div className="flex justify-between mb-2">
                        <span>Текущий процент:</span>
                        <span className="font-semibold">
                          {result.currentPercentage.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Необходимый процент для оценки {targetGrade}:</span>
                        <span className="font-semibold">
                          {result.requiredPercentage}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Статус:</span>
                        <span 
                          className={`font-semibold ${
                            result.possible ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {result.possible 
                            ? 'Оценка достижима' 
                            : 'Невозможно достичь целевой оценки'
                          }
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead className="text-right">Макс. баллы</TableHead>
                        <TableHead className="text-right">Текущие баллы</TableHead>
                        <TableHead className="text-right">Требуемые баллы</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessmentsWithMarks.map(assessment => {
                        // Определяем тип оценивания на русском
                        const typeLabels = {
                          'formative': 'Формативное',
                          'summative': 'СОР',
                          'exam': 'СОЧ'
                        }
                        
                        return (
                          <TableRow key={assessment.id}>
                            <TableCell>{assessment.title}</TableCell>
                            <TableCell>{typeLabels[assessment.type]}</TableCell>
                            <TableCell className="text-right">
                              {assessment.maxMarks}
                            </TableCell>
                            <TableCell className="text-right">
                              {assessment.userMarks !== null ? (
                                assessment.userMarks
                              ) : (
                                <Input
                                  type="number"
                                  min={0}
                                  max={assessment.maxMarks}
                                  value={assessment.userMarks ?? ''}
                                  onChange={(e) => 
                                    handleUserMarksChange(assessment.id, e.target.value)
                                  }
                                  className="w-16 h-8 text-right"
                                />
                              )}
                            </TableCell>
                            <TableCell 
                              className={`text-right ${
                                assessment.userMarks === null && assessment.requiredMarks !== undefined
                                  ? assessment.isPossible 
                                    ? 'text-green-500 font-semibold'
                                    : 'text-red-500 font-semibold'
                                  : ''
                              }`}
                            >
                              {assessment.userMarks === null && assessment.requiredMarks !== undefined
                                ? assessment.requiredMarks
                                : '-'
                              }
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubjectGradeCalculator 