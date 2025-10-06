import { NextResponse } from 'next/server'

// Моки предметов и оценок для демонстрации
const subjects = [
  { id: 'math', name: 'Математика', teacher: 'Иванова А.С.' },
  { id: 'physics', name: 'Физика', teacher: 'Петров К.Н.' },
  { id: 'biology', name: 'Биология', teacher: 'Смирнова Е.В.' },
  { id: 'chemistry', name: 'Химия', teacher: 'Кузнецов Д.А.' },
  { id: 'literature', name: 'Литература', teacher: 'Морозова Т.П.' }
]

// Информация о предметах с оценками
const subjectsDetails = {
  'math': {
    id: 'math',
    name: 'Математика',
    teacher: 'Иванова А.С.',
    assessments: [
      { 
        id: 'math-f1',
        title: 'Формативное оценивание 1: Алгебра', 
        type: 'formative', 
        maxMarks: 20, 
        userMarks: 15,
        quarter: 1
      },
      { 
        id: 'math-f2',
        title: 'Формативное оценивание 2: Геометрия', 
        type: 'formative', 
        maxMarks: 15, 
        userMarks: null,
        quarter: 1
      },
      { 
        id: 'math-s1',
        title: 'СОР 1: Уравнения и неравенства', 
        type: 'summative', 
        maxMarks: 30, 
        userMarks: 25,
        quarter: 1
      },
      { 
        id: 'math-s2',
        title: 'СОР 2: Функции', 
        type: 'summative', 
        maxMarks: 25, 
        userMarks: null,
        quarter: 1
      },
      { 
        id: 'math-e1',
        title: 'СОЧ 1', 
        type: 'exam', 
        maxMarks: 40, 
        userMarks: null,
        quarter: 1
      }
    ]
  },
  'physics': {
    id: 'physics',
    name: 'Физика',
    teacher: 'Петров К.Н.',
    assessments: [
      { 
        id: 'phys-f1',
        title: 'Формативное оценивание 1: Механика', 
        type: 'formative', 
        maxMarks: 15, 
        userMarks: 12,
        quarter: 1
      },
      { 
        id: 'phys-s1',
        title: 'СОР 1: Кинематика', 
        type: 'summative', 
        maxMarks: 20, 
        userMarks: 18,
        quarter: 1
      },
      { 
        id: 'phys-s2',
        title: 'СОР 2: Динамика', 
        type: 'summative', 
        maxMarks: 25, 
        userMarks: null,
        quarter: 1
      },
      { 
        id: 'phys-e1',
        title: 'СОЧ 1', 
        type: 'exam', 
        maxMarks: 35, 
        userMarks: null,
        quarter: 1
      }
    ]
  },
  'biology': {
    id: 'biology',
    name: 'Биология',
    teacher: 'Смирнова Е.В.',
    assessments: [
      { 
        id: 'bio-f1',
        title: 'Формативное оценивание 1: Клетки', 
        type: 'formative', 
        maxMarks: 10, 
        userMarks: 8,
        quarter: 1
      },
      { 
        id: 'bio-f2',
        title: 'Формативное оценивание 2: Организмы', 
        type: 'formative', 
        maxMarks: 15, 
        userMarks: 13,
        quarter: 1 
      },
      { 
        id: 'bio-s1',
        title: 'СОР 1: Анатомия', 
        type: 'summative', 
        maxMarks: 30,
        userMarks: null,
        quarter: 1
      },
      { 
        id: 'bio-e1',
        title: 'СОЧ 1', 
        type: 'exam', 
        maxMarks: 40, 
        userMarks: null,
        quarter: 1
      }
    ]
  },
  'chemistry': {
    id: 'chemistry',
    name: 'Химия',
    teacher: 'Кузнецов Д.А.',
    assessments: [
      { 
        id: 'chem-f1',
        title: 'Формативное оценивание 1: Таблица Менделеева', 
        type: 'formative', 
        maxMarks: 15, 
        userMarks: 10,
        quarter: 1
      },
      { 
        id: 'chem-s1',
        title: 'СОР 1: Химические реакции', 
        type: 'summative', 
        maxMarks: 25, 
        userMarks: 20,
        quarter: 1
      },
      { 
        id: 'chem-e1',
        title: 'СОЧ 1', 
        type: 'exam', 
        maxMarks: 30, 
        userMarks: null,
        quarter: 1
      }
    ]
  },
  'literature': {
    id: 'literature',
    name: 'Литература',
    teacher: 'Морозова Т.П.',
    assessments: [
      { 
        id: 'lit-f1',
        title: 'Формативное оценивание 1: Анализ текста', 
        type: 'formative', 
        maxMarks: 20, 
        userMarks: 17,
        quarter: 1
      },
      { 
        id: 'lit-s1',
        title: 'СОР 1: Эссе', 
        type: 'summative', 
        maxMarks: 30, 
        userMarks: 25,
        quarter: 1
      },
      { 
        id: 'lit-s2',
        title: 'СОР 2: Поэзия', 
        type: 'summative', 
        maxMarks: 25, 
        userMarks: null,
        quarter: 1
      },
      { 
        id: 'lit-e1',
        title: 'СОЧ 1', 
        type: 'exam', 
        maxMarks: 40, 
        userMarks: null,
        quarter: 1
      }
    ]
  }
}

// GET обработчик для получения предметов
export async function GET(request: Request) {
  // Получаем query параметры
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  
  // Если указан id предмета, возвращаем детальную информацию
  if (id && id in subjectsDetails) {
    return NextResponse.json(subjectsDetails[id as keyof typeof subjectsDetails])
  }
  
  // Иначе возвращаем список всех предметов
  return NextResponse.json({ subjects })
} 