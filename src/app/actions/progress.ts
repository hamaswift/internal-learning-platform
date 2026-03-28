'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeLesson(lessonId: string, courseId: string) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    throw new Error('Unauthorized')
  }

  const userId = data.claims.sub

  // 受講登録チェック
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .maybeSingle()

  if (!enrollment) throw new Error('受講登録が必要です')

  const { error } = await supabase.from('progress').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' }
  )

  if (error) throw new Error(error.message)

  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`)
  revalidatePath(`/courses/${courseId}`)
}

export async function uncompleteLesson(lessonId: string, courseId: string) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    throw new Error('Unauthorized')
  }

  const userId = data.claims.sub

  // 受講登録チェック
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .maybeSingle()

  if (!enrollment) throw new Error('受講登録が必要です')

  const { error } = await supabase.from('progress').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed: false,
      completed_at: null,
    },
    { onConflict: 'user_id,lesson_id' }
  )

  if (error) throw new Error(error.message)

  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`)
  revalidatePath(`/courses/${courseId}`)
}
