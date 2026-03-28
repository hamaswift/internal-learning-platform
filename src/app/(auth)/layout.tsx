import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    redirect('/courses')
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  )
}
