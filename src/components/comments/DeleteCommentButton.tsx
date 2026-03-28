'use client'

import { useTransition } from 'react'
import { deleteComment } from '@/app/actions/comments'

type Props = {
  commentId: string
  lessonId: string
  courseId: string
}

export function DeleteCommentButton({ commentId, lessonId, courseId }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!confirm('このコメントを削除しますか？')) return
    startTransition(() => deleteComment(commentId, lessonId, courseId))
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="ml-auto text-xs text-gray-400 hover:text-red-500 disabled:opacity-50"
    >
      {isPending ? '削除中...' : '削除'}
    </button>
  )
}
