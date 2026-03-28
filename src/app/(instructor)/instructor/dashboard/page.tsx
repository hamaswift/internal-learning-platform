import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { togglePublish, deleteCourse } from '@/app/actions/instructor'

export default async function InstructorDashboard() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub!

  const { data: courses } = await supabase
    .from('courses')
    .select(`
      id, title, published, created_at, updated_at,
      categories ( name ),
      lessons ( id )
    `)
    .eq('instructor_id', userId)
    .order('updated_at', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">講師ダッシュボード</h1>
        <Link
          href="/instructor/courses/new"
          className="flex items-center gap-2 rounded-md bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          新しい講座を作成
        </Link>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="mt-4 text-sm text-gray-500">講座がありません</p>
          <Link
            href="/instructor/courses/new"
            className="mt-4 inline-block text-sm font-medium text-purple-700 hover:underline"
          >
            最初の講座を作成する →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {courses.map((course) => {
            const lessonCount = Array.isArray(course.lessons) ? course.lessons.length : 0
            const category = Array.isArray(course.categories) ? course.categories[0] : course.categories

            return (
              <div key={course.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      course.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {course.published ? '公開中' : '非公開'}
                    </span>
                    {category && (
                      <span className="text-xs text-gray-500">{category.name}</span>
                    )}
                  </div>
                  <h2 className="mt-1 truncate font-semibold text-gray-900">{course.title}</h2>
                  <p className="text-xs text-gray-500">{lessonCount} レッスン</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {/* 公開トグル */}
                  <form action={togglePublish.bind(null, course.id, !course.published)}>
                    <button
                      type="submit"
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      {course.published ? '非公開にする' : '公開する'}
                    </button>
                  </form>

                  <Link
                    href={`/instructor/courses/${course.id}/edit`}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    編集
                  </Link>

                  <form action={deleteCourse.bind(null, course.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                      onClick={(e) => {
                        if (!confirm('この講座を削除しますか？')) e.preventDefault()
                      }}
                    >
                      削除
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
