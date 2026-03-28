import Link from 'next/link'
import { createLesson } from '@/app/actions/instructor'
import { LessonForm } from '@/components/instructor/LessonForm'

type Props = {
  params: Promise<{ courseId: string }>
}

export default async function NewLessonPage({ params }: Props) {
  const { courseId } = await params
  const action = createLesson.bind(null, courseId)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/instructor/courses/${courseId}/edit`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 講座編集
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">レッスンを追加</h1>
      </div>

      <LessonForm action={action} courseId={courseId} />
    </div>
  )
}
