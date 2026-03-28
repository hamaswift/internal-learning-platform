import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // request 側にもセット（以降の処理で参照できるように）
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // response 側にもセット（ブラウザへ Set-Cookie を送る）
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // トークンリフレッシュ & 認証確認（getClaims はプロジェクト公開鍵で JWT を検証する）
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  const { pathname } = request.nextUrl

  // 未認証 → /login へリダイレクト（/login と /auth/* は除外）
  if (!claims && pathname !== '/login' && !pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ロールベースアクセス制御
  if (claims) {
    // ロールキャッシュ: JWT の iat をキーにし、トークン更新時に自動無効化
    const jwtIat = String(claims.iat ?? '')
    const roleCookie = request.cookies.get('_role_cache')?.value
    let role: string | undefined

    if (roleCookie) {
      const sepIdx = roleCookie.indexOf(':')
      const cachedIat = roleCookie.slice(0, sepIdx)
      const cachedRole = roleCookie.slice(sepIdx + 1)
      if (cachedIat === jwtIat && cachedRole) {
        role = cachedRole
      }
    }

    if (!role) {
      // キャッシュミス時のみ DB クエリ
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', claims.sub)
        .single()
      role = profile?.role ?? 'learner'
      // JWT の iat と紐づけてキャッシュ（JWT 更新 = iat 変化 → 自動無効化）
      response.cookies.set('_role_cache', `${jwtIat}:${role}`, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60, // JWT 有効期限（1時間）に合わせた安全弁
      })
    }

    // /instructor/* は instructor / admin のみ
    if (
      pathname.startsWith('/instructor') &&
      role !== 'instructor' &&
      role !== 'admin'
    ) {
      return NextResponse.redirect(new URL('/courses', request.url))
    }

    // /admin/* は admin のみ
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/courses', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
