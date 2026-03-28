export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="animate-pulse">
        <div className="mb-6 h-8 w-48 rounded bg-gray-200" />
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-10 w-full rounded bg-gray-200" />
            </div>
          ))}
          <div className="h-10 w-28 rounded bg-gray-200" />
        </div>
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-32 rounded bg-gray-200" />
            <div className="h-9 w-28 rounded bg-gray-200" />
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
