import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { enroll } from '@/app/actions/enrollment'

type Props = {
  params: Promise<{ courseId: string }>
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params
  const supabase = await createClient()

  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub

  const [{ data: course }, { data: enrollment }, { data: progress }] =
    await Promise.all([
      supabase
        .from('courses')
        .select(`
          id, title, description, thumbnail_url, published,
          profiles!instructor_id ( full_name ),
          categories ( name ),
          lessons ( id, title, position )
        `)
        .eq('id', courseId)
        .eq('published', true)
        .single(),
      userId
        ? supabase.from('enrollments').select('id').eq('course_id', courseId).eq('user_id', userId).maybeSingle()
        : Promise.resolve({ data: null }),
      userId
        ? supabase.from('progress').select('lesson_id').eq('user_id', userId).eq('completed', true)
        : Promise.resolve({ data: [] }),
    ])

  if (!course) notFound()

  const lessons = [...(course.lessons ?? [])].sort((a, b) => a.position - b.position)
  const completedIds = new Set((progress ?? []).map((p) => p.lesson_id))
  const instructor = Array.isArray(course.profiles) ? course.profiles[0] : course.profiles
  const category = Array.isArray(course.categories) ? course.categories[0] : course.categories
  const isEnrolled = !!enrollment
  const completedCount = lessons.filter((l) => completedIds.has(l.id)).length
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  return (
    <div className="min-h-full bg-white">
      {/* ヘッダーバナー */}
      <div className="bg-gray-900 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <Link href="/courses" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            講座一覧
          </Link>
          {category && (
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-400">{category.name}</p>
          )}
          <h1 className="mt-1 text-3xl font-bold leading-snug text-white">{course.title}</h1>
          {instructor && (
            <p className="mt-2 text-sm text-gray-300">
              <span className="text-gray-500">講師: </span>{instructor.full_name}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* メインコンテンツ */}
          <div className="flex-1 space-y-6">
            {/* サムネイル */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
              {course.thumbnail_url ? (
                <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" priority />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                </div>
              )}
            </div>

            {/* このコースで学べること */}
            {course.description && (
              <div className="rounded-lg border border-gray-200 p-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900">このコースで学べること</h2>
                <div className="space-y-2">
                  {course.description.split('\n').filter(Boolean).map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700">{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* カリキュラム */}
            <div>
              <h2 className="mb-3 text-lg font-bold text-gray-900">
                コースコンテンツ <span className="text-sm font-normal text-gray-500">({lessons.length} レッスン)</span>
              </h2>
              {lessons.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">レッスンがありません</p>
              ) : (
                <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
                  {lessons.map((lesson, index) => {
                    const completed = completedIds.has(lesson.id)
                    return (
                      <li key={lesson.id}>
                        {isEnrolled ? (
                          <Link
                            href={`/courses/${courseId}/lessons/${lesson.id}`}
                            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                              {completed ? (
                                <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-[10px] font-medium text-gray-500">
                                  {index + 1}
                                </span>
                              )}
                            </span>
                            <span className={`text-sm ${completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                              {lesson.title}
                            </span>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 px-4 py-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-200 text-[10px] font-medium text-gray-400">
                              {index + 1}
                            </span>
                            <span className="text-sm text-gray-500">{lesson.title}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="ml-auto h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* サイドバー */}
          <div className="lg:w-80 lg:shrink-0">
            <div className="sticky top-20 rounded-lg border border-gray-200 p-5 shadow-lg space-y-4">
              {isEnrolled ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-green-600">受講中</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">学習進捗</span>
                      <span className="font-semibold text-purple-700">{progressPct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-purple-700 transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="text-center text-xs text-gray-500">
                      {completedCount} / {lessons.length} レッスン完了
                    </p>
                  </div>
                  {lessons.length > 0 && (
                    <Link
                      href={`/courses/${courseId}/lessons/${lessons.find(l => !completedIds.has(l.id))?.id ?? lessons[0].id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-purple-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      学習を続ける
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-700">このコースを受講して学習を始めましょう</p>
                  <form action={enroll.bind(null, courseId)}>
                    <button
                      type="submit"
                      className="w-full rounded-md bg-purple-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-800"
                    >
                      無料で受講登録する
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
