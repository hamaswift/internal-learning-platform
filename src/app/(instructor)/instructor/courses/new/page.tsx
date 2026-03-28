import { createClient } from '@/lib/supabase/server'
import { createCourse } from '@/app/actions/instructor'
import Link from 'next/link'

export default async function NewCoursePage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('id, name').order('name')

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/instructor/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          ← ダッシュボード
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">新しい講座を作成</h1>
      </div>

      <form action={createCourse} className="space-y-5 rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            type="text"
            required
            placeholder="例: React 完全入門"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">説明</label>
          <textarea
            name="description"
            rows={4}
            placeholder="この講座で学べることを入力してください（改行区切りで箇条書きになります）"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">サムネイルURL</label>
          <input
            name="thumbnail_url"
            type="url"
            placeholder="https://..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">カテゴリ</label>
          <select
            name="category_id"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">カテゴリなし</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            name="published"
            value="true"
            className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-500"
          />
          <label htmlFor="published" className="text-sm text-gray-700">
            作成後すぐに公開する
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-purple-700 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-800"
          >
            作成する
          </button>
          <Link
            href="/instructor/dashboard"
            className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
