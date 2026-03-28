import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateCourse, deleteLesson } from '@/app/actions/instructor'
import { LessonReorderList } from '@/components/instructor/LessonReorderList'

type Props = {
  params: Promise<{ courseId: string }>
}

export default async function EditCoursePage({ params }: Props) {
  const { courseId } = await params
  const supabase = await createClient()

  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub!

  const [{ data: course }, { data: categories }, { data: lessons }] = await Promise.all([
    supabase
      .from('courses')
      .select('id, title, description, thumbnail_url, published, category_id, instructor_id')
      .eq('id', courseId)
      .single(),
    supabase.from('categories').select('id, name').order('name'),
    supabase
      .from('lessons')
      .select('id, title, content_type, position')
      .eq('course_id', courseId)
      .order('position'),
  ])

  if (!course || course.instructor_id !== userId) notFound()

  const updateCourseWithId = updateCourse.bind(null, courseId)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/instructor/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          ← ダッシュボード
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">講座を編集</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 講座情報フォーム */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">講座情報</h2>
          <form action={updateCourseWithId} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                type="text"
                required
                defaultValue={course.title}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">説明</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={course.description ?? ''}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">サムネイルURL</label>
              <input
                name="thumbnail_url"
                type="url"
                defaultValue={course.thumbnail_url ?? ''}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">カテゴリ</label>
              <select
                name="category_id"
                defaultValue={course.category_id ?? ''}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">カテゴリなし</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                name="published"
                value="true"
                defaultChecked={course.published}
                className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-500"
              />
              <label htmlFor="published" className="text-sm text-gray-700">公開する</label>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-800"
            >
              保存する
            </button>
          </form>
        </div>

        {/* レッスン一覧 */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">レッスン一覧</h2>
            <Link
              href={`/instructor/courses/${courseId}/lessons/new`}
              className="flex items-center gap-1.5 rounded-md bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-purple-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              レッスン追加
            </Link>
          </div>

          {!lessons || lessons.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">レッスンがありません</p>
          ) : (
            <LessonReorderList courseId={courseId} initialLessons={lessons} />
          )}
        </div>
      </div>
    </div>
  )
}
