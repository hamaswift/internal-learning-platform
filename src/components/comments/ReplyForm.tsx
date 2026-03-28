'use client'

import { useState, useTransition, useRef } from 'react'
import { postReply } from '@/app/actions/comments'

type Props = {
  lessonId: string
  courseId: string
  parentId: string
}

export function ReplyForm({ lessonId, courseId, parentId }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const action = (formData: FormData) => {
    startTransition(async () => {
      await postReply(lessonId, courseId, parentId, formData)
      formRef.current?.reset()
      setIsOpen(false)
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-gray-500 hover:text-purple-700 hover:underline"
      >
        返信する
      </button>
    )
  }

  return (
    <form ref={formRef} action={action} className="mt-2 space-y-2">
      <textarea
        name="body"
        rows={2}
        required
        autoFocus
        placeholder="返信を入力..."
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-purple-800 disabled:opacity-50"
        >
          {isPending ? '投稿中...' : '返信する'}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
