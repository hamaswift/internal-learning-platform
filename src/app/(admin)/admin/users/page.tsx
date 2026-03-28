import { createClient } from '@/lib/supabase/server'
import { RoleSelector } from '@/components/admin/RoleSelector'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const currentUserId = claims?.claims?.sub!

  const { data: users, error } = await supabase.rpc('get_admin_users')

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          全ユーザーのロールを管理できます。自分自身のロールは変更できません。
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          データの取得に失敗しました: {error.message}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">名前</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">メールアドレス</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">ロール</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">登録日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {!users || users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                  ユーザーがいません
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isSelf = user.id === currentUserId
                return (
                  <tr key={user.id} className={isSelf ? 'bg-purple-50' : ''}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                          {user.full_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {user.full_name ?? '未設定'}
                          {isSelf && (
                            <span className="ml-1.5 rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700">
                              あなた
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-5 py-3">
                      <RoleSelector
                        userId={user.id}
                        currentRole={user.role}
                        isSelf={isSelf}
                      />
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
