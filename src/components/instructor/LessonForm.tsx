'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MarkdownEditor } from '@/components/lessons/MarkdownEditor'

type Props = {
  action: (formData: FormData) => Promise<void>
  courseId: string
  defaultValues?: {
    title: string
    content_type: 'video' | 'text'
    video_url: string
    body: string
  }
}

export function LessonForm({ action, courseId, defaultValues }: Props) {
  const [contentType, setContentType] = useState<'video' | 'text'>(
    defaultValues?.content_type ?? 'video'
  )

  return (
    <form action={action} className="space-y-5 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          defaultValue={defaultValues?.title}
          placeholder="例: Reactとは何か"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">コンテンツタイプ</label>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="content_type"
              value="video"
              checked={contentType === 'video'}
              onChange={() => setContentType('video')}
              className="h-4 w-4 text-purple-700 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">動画（YouTube / Vimeo）</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="content_type"
              value="text"
              checked={contentType === 'text'}
              onChange={() => setContentType('text')}
              className="h-4 w-4 text-purple-700 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">テキスト記事（Markdown）</span>
          </label>
        </div>
      </div>

      {contentType === 'video' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            動画URL <span className="text-red-500">*</span>
          </label>
          <input
            name="video_url"
            type="url"
            defaultValue={defaultValues?.video_url}
            placeholder="https://www.youtube.com/watch?v=..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <p className="mt-1 text-xs text-gray-500">YouTube または Vimeo の URL を入力してください</p>
        </div>
      )}

      {contentType === 'text' && (
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Markdown 本文
          </label>
          <MarkdownEditor name="body" defaultValue={defaultValues?.body} />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-md bg-purple-700 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-800"
        >
          保存する
        </button>
        <Link
          href={`/instructor/courses/${courseId}/edit`}
          className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          キャンセル
        </Link>
      </div>
    </form>
  )
}
