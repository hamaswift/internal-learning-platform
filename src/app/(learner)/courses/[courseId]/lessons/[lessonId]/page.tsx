import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { VideoPlayer } from '@/components/lessons/VideoPlayer'
import { MarkdownRenderer } from '@/components/lessons/MarkdownRenderer'
import { CompleteButton } from '@/components/lessons/CompleteButton'
import { CommentList } from '@/components/comments/CommentList'
import { CommentForm } from '@/components/comments/CommentForm'

type Props = {
  params: Promise<{ courseId: string; lessonId: string }>
}

export default async function LessonPage({ params }: Props) {
  const { courseId, lessonId } = await params
  const supabase = await createClient()

  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub

  if (!userId) redirect('/login')

  const [{ data: lesson }, { data: allLessons }, { data: enrollment }, { data: progressRow }] =
    await Promise.all([
      supabase
        .from('lessons')
        .select('id, title, content_type, video_url, body, position, course_id')
        .eq('id', lessonId)
        .eq('course_id', courseId)
        .single(),
      supabase
        .from('lessons')
        .select('id, title, position')
        .eq('course_id', courseId)
        .order('position'),
      supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('progress')
        .select('completed')
        .eq('lesson_id', lessonId)
        .eq('user_id', userId)
        .maybeSingle(),
    ])

  if (!lesson) notFound()

  // 受講登録していないユーザーは講座詳細にリダイレクト
  if (!enrollment) {
    redirect(`/courses/${courseId}`)
  }

  const sorted = allLessons ?? []
  const currentIndex = sorted.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? sorted[currentIndex - 1] : null
  const nextLesson = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null
  const isCompleted = progressRow?.completed ?? false

  return (
    <div className="min-h-full bg-white">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* メインコンテンツ */}
        <main className="flex flex-1 flex-col overflow-y-auto bg-white">
          <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8">
            {/* タイトル */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  {currentIndex + 1} / {sorted.length}
                </p>
                <h1 className="text-xl font-bold text-gray-900">{lesson.title}</h1>
              </div>
              <CompleteButton lessonId={lessonId} courseId={courseId} completed={isCompleted} />
            </div>

            {/* コンテンツ */}
            {lesson.content_type === 'video' && lesson.video_url && (
              <VideoPlayer url={lesson.video_url} title={lesson.title} />
            )}

            {lesson.content_type === 'text' && lesson.body && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 prose max-w-none">
                <MarkdownRenderer content={lesson.body} />
              </div>
            )}

            {/* コメント */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
              <h2 className="text-base font-bold text-gray-900">コメント・質問</h2>
              <CommentForm lessonId={lessonId} courseId={courseId} />
              <hr className="border-gray-200" />
              <Suspense fallback={<p className="text-sm text-gray-400">読み込み中...</p>}>
                <CommentList lessonId={lessonId} courseId={courseId} currentUserId={userId} />
              </Suspense>
            </div>

            {/* ナビゲーション */}
            <div className="flex w-full items-center justify-between border-t border-gray-200 pt-6">
              {prevLesson ? (
                <Link
                  href={`/courses/${courseId}/lessons/${prevLesson.id}`}
                  className="group flex max-w-[45%] items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-3 text-xs transition-all hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500">前のレッスン</p>
                    <p className="truncate text-gray-700">{prevLesson.title}</p>
                  </div>
                </Link>
              ) : <div />}

              {nextLesson ? (
                <Link
                  href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                  className="group flex max-w-[45%] items-center gap-2 rounded-md bg-purple-700 px-4 py-3 text-xs text-white transition-colors hover:bg-purple-800"
                >
                  <div className="min-w-0 text-right">
                    <p className="text-[10px] text-purple-300">次のレッスン</p>
                    <p className="truncate text-white">{nextLesson.title}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              ) : <div />}
            </div>
          </div>
        </main>

        {/* サイドバー */}
        <aside className="hidden w-80 shrink-0 flex-col border-l border-gray-200 bg-gray-50 lg:flex">
          <div className="border-b border-gray-200 px-4 py-3.5">
            <Link
              href={`/courses/${courseId}`}
              className="flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              講座トップ
            </Link>
          </div>
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-bold text-gray-900">コースコンテンツ</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sorted.map((l, index) => {
              const isActive = l.id === lessonId
              return (
                <Link
                  key={l.id}
                  href={`/courses/${courseId}/lessons/${l.id}`}
                  className={`flex items-start gap-3 px-4 py-3 text-xs transition-colors ${
                    isActive
                      ? 'border-l-2 border-purple-700 bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${
                    isActive ? 'bg-purple-700 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="line-clamp-2 leading-relaxed">{l.title}</span>
                </Link>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
