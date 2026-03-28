import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateLesson } from '@/app/actions/instructor'
import { LessonForm } from '@/components/instructor/LessonForm'

type Props = {
  params: Promise<{ courseId: string; lessonId: string }>
}

export default async function EditLessonPage({ params }: Props) {
  const { courseId, lessonId } = await params
  const supabase = await createClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, title, content_type, video_url, body, position')
    .eq('id', lessonId)
    .eq('course_id', courseId)
    .single()

  if (!lesson) notFound()

  const action = updateLesson.bind(null, courseId, lessonId)

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
        <h1 className="text-xl font-bold text-gray-900">レッスンを編集</h1>
      </div>

      <LessonForm
        action={action}
        courseId={courseId}
        defaultValues={{
          title: lesson.title,
          content_type: lesson.content_type as 'video' | 'text',
          video_url: lesson.video_url ?? '',
          body: lesson.body ?? '',
        }}
      />
    </div>
  )
}
