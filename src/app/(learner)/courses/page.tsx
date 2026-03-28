import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { CourseCard } from '@/components/courses/CourseCard'
import { CourseFilter } from '@/components/courses/CourseFilter'
import { CourseListSkeleton } from './loading'

type Props = {
  searchParams: Promise<{ q?: string; category?: string }>
}

async function CourseList({
  q,
  category,
}: {
  q: string | undefined
  category: string | undefined
}) {
  const supabase = await createClient()

  let query = supabase
    .from('courses')
    .select(
      `id, title, description, thumbnail_url,
      profiles!instructor_id ( full_name ),
      categories ( name )`
    )
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  if (category) query = query.eq('category_id', Number(category))

  const { data: courses } = await query

  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700">講座が見つかりません</p>
        <p className="mt-1 text-xs text-gray-500">検索条件を変えてみてください</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const instructor = Array.isArray(course.profiles) ? course.profiles[0] : course.profiles
        const cat = Array.isArray(course.categories) ? course.categories[0] : course.categories
        return (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            description={course.description}
            thumbnailUrl={course.thumbnail_url}
            instructorName={instructor?.full_name ?? null}
            categoryName={cat?.name ?? null}
          />
        )
      })}
    </div>
  )
}

export default async function CoursesPage({ searchParams }: Props) {
  const [{ q, category }, supabase] = await Promise.all([
    searchParams,
    createClient(),
  ])

  const { data: categories } = await supabase.from('categories').select('id, name').order('name')

  return (
    <div className="min-h-full bg-white">
      {/* ヒーローセクション */}
      <div className="bg-gray-900 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold text-white">すべての講座</h1>
          <p className="mt-1 text-sm text-gray-300">あなたのスキルアップをサポートする講座が揃っています</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <CourseFilter categories={categories ?? []} />

        <Suspense fallback={<CourseListSkeleton />}>
          <CourseList q={q} category={category} />
        </Suspense>
      </div>
    </div>
  )
}
