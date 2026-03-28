export function CourseListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="aspect-video w-full animate-pulse bg-gray-200" />
          <div className="flex flex-col gap-3 p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="mt-1 h-3 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Loading() {
  return (
    <div>
      <div className="bg-gray-900 px-4 py-12">
        <div className="mx-auto max-w-6xl space-y-2">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-700" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-700" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="h-11 animate-pulse rounded-md bg-gray-200" />
        <CourseListSkeleton />
      </div>
    </div>
  )
}
