'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getInstructorId() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.claims.sub)
    .single()

  if (profile?.role !== 'instructor' && profile?.role !== 'admin') {
    throw new Error('Forbidden')
  }

  return { supabase, userId: data.claims.sub }
}

// ==================== 講座 ====================

export async function createCourse(formData: FormData) {
  const { supabase, userId } = await getInstructorId()

  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const thumbnailUrl = (formData.get('thumbnail_url') as string)?.trim()
  const categoryId = formData.get('category_id') as string
  const published = formData.get('published') === 'true'

  if (!title) throw new Error('タイトルは必須です')
  if (title.length > 255) throw new Error('タイトルは255文字以内で入力してください')
  if (description && description.length > 5000) throw new Error('説明は5000文字以内で入力してください')

  const parsedCategoryId = categoryId ? parseInt(categoryId, 10) : null
  if (categoryId && isNaN(parsedCategoryId!)) throw new Error('カテゴリが不正です')

  const { data, error } = await supabase
    .from('courses')
    .insert({
      instructor_id: userId,
      title,
      description: description || null,
      thumbnail_url: thumbnailUrl || null,
      category_id: parsedCategoryId,
      published,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/instructor/dashboard')
  redirect(`/instructor/courses/${data.id}/edit`)
}

export async function updateCourse(courseId: string, formData: FormData) {
  const { supabase, userId } = await getInstructorId()

  // 自分の講座のみ更新可
  const { data: existing } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', courseId)
    .single()

  if (!existing || existing.instructor_id !== userId) throw new Error('Forbidden')

  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const thumbnailUrl = (formData.get('thumbnail_url') as string)?.trim()
  const categoryId = formData.get('category_id') as string
  const published = formData.get('published') === 'true'

  if (!title) throw new Error('タイトルは必須です')
  if (title.length > 255) throw new Error('タイトルは255文字以内で入力してください')
  if (description && description.length > 5000) throw new Error('説明は5000文字以内で入力してください')

  const parsedCategoryId = categoryId ? parseInt(categoryId, 10) : null
  if (categoryId && isNaN(parsedCategoryId!)) throw new Error('カテゴリが不正です')

  const { error } = await supabase
    .from('courses')
    .update({
      title,
      description: description || null,
      thumbnail_url: thumbnailUrl || null,
      category_id: parsedCategoryId,
      published,
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId)

  if (error) throw new Error(error.message)

  revalidatePath('/instructor/dashboard')
  revalidatePath(`/instructor/courses/${courseId}/edit`)
  revalidatePath(`/courses/${courseId}`)
}

export async function deleteCourse(courseId: string) {
  const { supabase, userId } = await getInstructorId()

  const { data: existing } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', courseId)
    .single()

  if (!existing || existing.instructor_id !== userId) throw new Error('Forbidden')

  const { error } = await supabase.from('courses').delete().eq('id', courseId)
  if (error) throw new Error(error.message)

  revalidatePath('/instructor/dashboard')
  redirect('/instructor/dashboard')
}

export async function togglePublish(courseId: string, published: boolean) {
  const { supabase, userId } = await getInstructorId()

  const { data: existing } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', courseId)
    .single()

  if (!existing || existing.instructor_id !== userId) throw new Error('Forbidden')

  const { error } = await supabase
    .from('courses')
    .update({ published, updated_at: new Date().toISOString() })
    .eq('id', courseId)

  if (error) throw new Error(error.message)

  revalidatePath('/instructor/dashboard')
  revalidatePath(`/courses/${courseId}`)
}

// ==================== レッスン ====================

export async function createLesson(courseId: string, formData: FormData) {
  const { supabase, userId } = await getInstructorId()

  // 自分の講座のみ
  const { data: course } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', courseId)
    .single()

  if (!course || course.instructor_id !== userId) throw new Error('Forbidden')

  // 末尾のpositionを取得
  const { data: lastLesson } = await supabase
    .from('lessons')
    .select('position')
    .eq('course_id', courseId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const position = lastLesson ? lastLesson.position + 1 : 0

  const title = (formData.get('title') as string)?.trim()
  const contentType = formData.get('content_type') as string
  const videoUrl = (formData.get('video_url') as string)?.trim()
  const body = (formData.get('body') as string)?.trim()

  if (!title) throw new Error('タイトルは必須です')
  if (title.length > 255) throw new Error('タイトルは255文字以内で入力してください')
  if (!['video', 'text'].includes(contentType)) throw new Error('コンテンツタイプが不正です')
  if (body && body.length > 100000) throw new Error('本文は100000文字以内で入力してください')

  const { error } = await supabase.from('lessons').insert({
    course_id: courseId,
    title,
    content_type: contentType,
    video_url: contentType === 'video' ? videoUrl || null : null,
    body: contentType === 'text' ? body || null : null,
    position,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/instructor/courses/${courseId}/edit`)
  revalidatePath(`/courses/${courseId}`)
  redirect(`/instructor/courses/${courseId}/edit`)
}

export async function updateLesson(
  courseId: string,
  lessonId: string,
  formData: FormData
) {
  const { supabase, userId } = await getInstructorId()

  const { data: course } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', courseId)
    .single()

  if (!course || course.instructor_id !== userId) throw new Error('Forbidden')

  const title = (formData.get('title') as string)?.trim()
  const contentType = formData.get('content_type') as string
  const videoUrl = (formData.get('video_url') as string)?.trim()
  const body = (formData.get('body') as string)?.trim()

  if (!title) throw new Error('タイトルは必須です')
  if (title.length > 255) throw new Error('タイトルは255文字以内で入力してください')
  if (!['video', 'text'].includes(contentType)) throw new Error('コンテンツタイプが不正です')
  if (body && body.length > 100000) throw new Error('本文は100000文字以内で入力してください')

  const { error } = await supabase
    .from('lessons')
    .update({
      title,
      content_type: contentType,
      video_url: contentType === 'video' ? videoUrl || null : null,
      body: contentType === 'text' ? body || null : null,
    })
    .eq('id', lessonId)
    .eq('course_id', courseId)

  if (error) throw new Error(error.message)

  revalidatePath(`/instructor/courses/${courseId}/edit`)
  revalidatePath(`/courses/${courseId}`)
  redirect(`/instructor/courses/${courseId}/edit`)
}

export async function deleteLesson(courseId: string, lessonId: string) {
  const { supabase, userId } = await getInstructorId()

  const { data: course } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', courseId)
    .single()

  if (!course || course.instructor_id !== userId) throw new Error('Forbidden')

  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId)
    .eq('course_id', courseId)

  if (error) throw new Error(error.message)

  revalidatePath(`/instructor/courses/${courseId}/edit`)
  revalidatePath(`/courses/${courseId}`)
}

export async function reorderLessons(
  courseId: string,
  lessons: { id: string; position: number }[]
) {
  const { supabase, userId } = await getInstructorId()

  const { data: course } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', courseId)
    .single()

  if (!course || course.instructor_id !== userId) throw new Error('Forbidden')

  await Promise.all(
    lessons.map(({ id, position }) =>
      supabase.from('lessons').update({ position }).eq('id', id).eq('course_id', courseId)
    )
  )

  revalidatePath(`/instructor/courses/${courseId}/edit`)
  revalidatePath(`/courses/${courseId}`)
}
