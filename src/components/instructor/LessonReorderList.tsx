'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { deleteLesson, reorderLessons } from '@/app/actions/instructor'

type Lesson = {
  id: string
  title: string
  content_type: string
  position: number
}

type Props = {
  courseId: string
  initialLessons: Lesson[]
}

export function LessonReorderList({ courseId, initialLessons }: Props) {
  const [lessons, setLessons] = useState(initialLessons)
  const [isPending, startTransition] = useTransition()

  const moveUp = (index: number) => {
    if (index === 0) return
    const newLessons = [...lessons]
    ;[newLessons[index - 1], newLessons[index]] = [newLessons[index], newLessons[index - 1]]
    const updated = newLessons.map((l, i) => ({ ...l, position: i }))
    setLessons(updated)
    startTransition(() => reorderLessons(courseId, updated.map((l) => ({ id: l.id, position: l.position }))))
  }

  const moveDown = (index: number) => {
    if (index === lessons.length - 1) return
    const newLessons = [...lessons]
    ;[newLessons[index], newLessons[index + 1]] = [newLessons[index + 1], newLessons[index]]
    const updated = newLessons.map((l, i) => ({ ...l, position: i }))
    setLessons(updated)
    startTransition(() => reorderLessons(courseId, updated.map((l) => ({ id: l.id, position: l.position }))))
  }

  const handleDelete = (lessonId: string) => {
    if (!confirm('このレッスンを削除しますか？')) return
    startTransition(async () => {
      await deleteLesson(courseId, lessonId)
      setLessons((prev) => prev.filter((l) => l.id !== lessonId))
    })
  }

  return (
    <ul className="divide-y divide-gray-200">
      {lessons.map((lesson, index) => (
        <li key={lesson.id} className="flex items-center gap-2 py-2.5">
          {/* 並び替えボタン */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => moveUp(index)}
              disabled={index === 0 || isPending}
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => moveDown(index)}
              disabled={index === lessons.length - 1 || isPending}
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <p className="truncate text-sm text-gray-800">{lesson.title}</p>
            <span className={`text-[10px] font-medium ${
              lesson.content_type === 'video' ? 'text-blue-600' : 'text-green-600'
            }`}>
              {lesson.content_type === 'video' ? '動画' : 'テキスト'}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              href={`/instructor/courses/${courseId}/lessons/${lesson.id}/edit`}
              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </Link>
            <button
              onClick={() => handleDelete(lesson.id)}
              disabled={isPending}
              className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
