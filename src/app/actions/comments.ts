'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function postComment(
  lessonId: string,
  courseId: string,
  formData: FormData
) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) throw new Error('Unauthorized')

  const userId = data.claims.sub

  // 受講登録チェック
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .maybeSingle()

  if (!enrollment) throw new Error('受講登録が必要です')

  const body = (formData.get('body') as string)?.trim()
  if (!body) throw new Error('コメント本文が必要です')
  if (body.length > 2000) throw new Error('コメントは2000文字以内で入力してください')

  const { error } = await supabase.from('comments').insert({
    lesson_id: lessonId,
    user_id: userId,
    body,
    parent_id: null,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`)
}

export async function postReply(
  lessonId: string,
  courseId: string,
  parentId: string,
  formData: FormData
) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) throw new Error('Unauthorized')

  const userId = data.claims.sub

  // 受講登録チェック（postComment と同様）
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .maybeSingle()

  if (!enrollment) throw new Error('受講登録が必要です')

  const body = (formData.get('body') as string)?.trim()
  if (!body) throw new Error('返信本文が必要です')
  if (body.length > 2000) throw new Error('返信は2000文字以内で入力してください')

  const { error } = await supabase.from('comments').insert({
    lesson_id: lessonId,
    user_id: data.claims.sub,
    body,
    parent_id: parentId,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`)
}

export async function deleteComment(
  commentId: string,
  lessonId: string,
  courseId: string
) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) throw new Error('Unauthorized')

  // 自分のコメントのみ削除可
  const { data: comment } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (!comment || comment.user_id !== data.claims.sub) throw new Error('Forbidden')

  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) throw new Error(error.message)

  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`)
}
