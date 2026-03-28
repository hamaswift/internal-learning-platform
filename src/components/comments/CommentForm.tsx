'use client'

import { useTransition, useRef } from 'react'
import { postComment } from '@/app/actions/comments'

type Props = {
  lessonId: string
  courseId: string
}

export function CommentForm({ lessonId, courseId }: Props) {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const action = (formData: FormData) => {
    startTransition(async () => {
      await postComment(lessonId, courseId, formData)
      formRef.current?.reset()
    })
  }

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <textarea
        name="body"
        rows={3}
        required
        placeholder="質問やコメントを入力してください..."
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-800 disabled:opacity-50"
      >
        {isPending ? '投稿中...' : 'コメントする'}
      </button>
    </form>
  )
}
