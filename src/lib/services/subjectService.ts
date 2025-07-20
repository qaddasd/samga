'use client'

import axios from 'axios'

export interface SubjectItem {
  id: string
  name: string
  teacher: string
}

export interface Assessment {
  id: string
  title: string
  type: 'formative' | 'summative' | 'exam'
  maxMarks: number
  userMarks?: number | null
  quarter: number
}

export interface SubjectDetail {
  id: string
  name: string
  teacher: string
  assessments: Assessment[]
}

// Получение списка всех предметов
export async function getSubjects(): Promise<SubjectItem[]> {
  try {
    const response = await axios.get('/api/v1/subjects')
    return response.data.subjects || []
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return []
  }
}

// Получение детальной информации о предмете
export async function getSubject(id: string): Promise<SubjectDetail | null> {
  try {
    const response = await axios.get(`/api/v1/subjects?id=${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching subject ${id}:`, error)
    return null
  }
}

// Расчет текущего результата по предмету
export function calculateSubjectResult(assessments: Assessment[]): {
  current: number;
  max: number;
  percentage: number;
} {
  const formativeAssessments = assessments.filter(a => a.type === 'formative')
  const summativeAssessments = assessments.filter(a => a.type === 'summative')
  const examAssessments = assessments.filter(a => a.type === 'exam')
  
  const formativeResult = calculateCategoryResult(formativeAssessments)
  const summativeResult = calculateCategoryResult(summativeAssessments) 
  const examResult = calculateCategoryResult(examAssessments)
  
  // Формативные - 25%, Суммативные - 25%, Экзамен - 50%
  const formativePercentage = formativeResult.percentage * 0.25
  const summativePercentage = summativeResult.percentage * 0.25
  const examPercentage = examResult.percentage * 0.5
  
  const totalPercentage = formativePercentage + summativePercentage + examPercentage
  
  return {
    current: formativeResult.current + summativeResult.current + examResult.current,
    max: formativeResult.max + summativeResult.max + examResult.max,
    percentage: totalPercentage
  }
}

// Расчет результата по категории (формативы/суммативы/экзамен)
function calculateCategoryResult(assessments: Assessment[]): {
  current: number;
  max: number;
  percentage: number;
} {
  if (!assessments.length) {
    return { current: 0, max: 0, percentage: 0 }
  }
  
  const max = assessments.reduce((sum, assessment) => sum + assessment.maxMarks, 0)
  const current = assessments.reduce((sum, assessment) => {
    if (assessment.userMarks !== undefined && assessment.userMarks !== null) {
      return sum + assessment.userMarks
    }
    return sum
  }, 0)
  
  return {
    current,
    max,
    percentage: max > 0 ? (current / max) * 100 : 0
  }
}

// Минимальные проценты для каждой оценки
const GRADE_THRESHOLDS = {
  '5': 85,
  '4': 65,
  '3': 40,
  '2': 0
}

// Расчет необходимых баллов для достижения оценки
export function calculateRequiredMarks(
  assessments: Assessment[], 
  targetGrade: keyof typeof GRADE_THRESHOLDS
): {
  requiredPercentage: number;
  currentPercentage: number;
  possible: boolean;
  remainingAssessments: {
    assessment: Assessment;
    requiredMarks: number;
    possible: boolean;
  }[];
} {
  const result = calculateSubjectResult(assessments)
  const targetPercentage = GRADE_THRESHOLDS[targetGrade]
  
  // Находим оценки, которые еще не получены (userMarks === null или undefined)
  const remainingAssessments = assessments
    .filter(assessment => assessment.userMarks === undefined || assessment.userMarks === null)
    .map(assessment => {
      // Рассчитываем сколько баллов нужно по каждой оставшейся оценке
      // Стратегия: распределяем оставшиеся проценты равномерно
      const assessmentsLeft = assessments.filter(a => 
        a.userMarks === undefined || a.userMarks === null
      ).length
      
      // Текущий общий процент
      const currentPercentage = result.percentage
      
      // Сколько процентов не хватает
      const neededPercentage = Math.max(0, targetPercentage - currentPercentage)
      
      // Какой процент от максимума нужно набрать
      const percentNeeded = assessmentsLeft > 0 ? neededPercentage / assessmentsLeft : 0
      
      // Множитель для типа оценки
      const typeFactor = assessment.type === 'exam' ? 0.5 : 0.25
      
      // Сколько баллов нужно набрать в этой оценке
      const requiredMarks = Math.ceil((percentNeeded * assessment.maxMarks) / (100 * typeFactor))
      
      return {
        assessment,
        requiredMarks: Math.min(requiredMarks, assessment.maxMarks),
        possible: requiredMarks <= assessment.maxMarks
      }
    })

  // Проверяем, возможно ли достичь целевой оценки
  const possible = result.percentage >= targetPercentage || 
    remainingAssessments.every(item => item.possible)
  
  return {
    requiredPercentage: targetPercentage,
    currentPercentage: result.percentage,
    possible,
    remainingAssessments
  }
} 