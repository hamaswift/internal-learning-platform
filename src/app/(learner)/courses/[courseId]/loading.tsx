export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="animate-pulse">
        <div className="h-64 rounded-xl bg-gray-200" />
        <div className="mt-6 h-8 w-2/3 rounded bg-gray-200" />
        <div className="mt-3 h-4 w-full rounded bg-gray-200" />
        <div className="mt-2 h-4 w-4/5 rounded bg-gray-200" />
        <div className="mt-8 h-6 w-1/4 rounded bg-gray-200" />
        <div className="mt-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  )
}
