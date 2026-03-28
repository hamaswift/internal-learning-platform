'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.claims.sub)
    .single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  return { supabase, userId: data.claims.sub }
}

export async function changeUserRole(targetUserId: string, newRole: string) {
  const { supabase, userId } = await requireAdmin()

  // 自分自身のロールは変更不可
  if (targetUserId === userId) throw new Error('自分自身のロールは変更できません')

  if (!['learner', 'instructor', 'admin'].includes(newRole)) {
    throw new Error('Invalid role')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', targetUserId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/users')
}
