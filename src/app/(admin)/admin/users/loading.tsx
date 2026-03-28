export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="animate-pulse">
        <div className="mb-6 h-8 w-40 rounded bg-gray-200" />
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
            <div className="flex gap-8">
              {['名前', 'メールアドレス', 'ロール', '登録日'].map((_, i) => (
                <div key={i} className="h-4 w-20 rounded bg-gray-200" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gray-200" />
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </div>
                <div className="h-4 w-40 rounded bg-gray-200" />
                <div className="h-8 w-28 rounded bg-gray-200" />
                <div className="h-4 w-20 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
