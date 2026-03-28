'use client'

import { useTransition } from 'react'
import { completeLesson, uncompleteLesson } from '@/app/actions/progress'

type Props = {
  lessonId: string
  courseId: string
  completed: boolean
}

export function CompleteButton({ lessonId, courseId, completed }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      if (completed) {
        await uncompleteLesson(lessonId, courseId)
      } else {
        await completeLesson(lessonId, courseId)
      }
    })
  }

  if (completed) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className="flex items-center gap-2 rounded-md border border-green-600 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        {isPending ? '更新中...' : '完了済み'}
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-2 rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-800 disabled:opacity-50"
    >
      {isPending ? (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {isPending ? '更新中...' : '完了にする'}
    </button>
  )
}
