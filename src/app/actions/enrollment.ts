'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function enroll(courseId: string) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('enrollments').insert({
    user_id: data.claims.sub,
    course_id: courseId,
  })

  // 重複登録は無視（unique 制約違反コード: 23505）
  if (error && error.code !== '23505') {
    throw new Error(error.message)
  }

  revalidatePath(`/courses/${courseId}`)
}
