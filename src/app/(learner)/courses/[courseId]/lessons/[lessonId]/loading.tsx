export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* サイドバー */}
      <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-gray-200 bg-white lg:block">
        <div className="animate-pulse p-4">
          <div className="mb-4 h-5 w-3/4 rounded bg-gray-200" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 rounded bg-gray-200" />
            ))}
          </div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="animate-pulse">
          <div className="aspect-video w-full rounded-xl bg-gray-200" />
          <div className="mt-4 h-7 w-2/3 rounded bg-gray-200" />
          <div className="mt-6 h-10 w-32 rounded bg-gray-200" />
        </div>
      </main>
    </div>
  )
}
