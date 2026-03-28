import Link from 'next/link'
import Image from 'next/image'

type Props = {
  id: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  instructorName: string | null
  categoryName: string | null
}

export function CourseCard({
  id,
  title,
  description,
  thumbnailUrl,
  instructorName,
  categoryName,
}: Props) {
  return (
    <Link
      href={`/courses/${id}`}
      className="group flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-md"
    >
      {/* サムネイル */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="flex flex-1 flex-col p-4">
        {categoryName && (
          <span className="mb-1 text-xs font-medium text-purple-700">
            {categoryName}
          </span>
        )}
        <h2 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900">
          {title}
        </h2>
        {instructorName && (
          <p className="mt-1 text-xs text-gray-500">{instructorName}</p>
        )}
        <div className="mt-2 flex items-center gap-1">
          <span className="text-xs text-yellow-400">★★★★★</span>
          <span className="text-xs text-gray-500">（新着）</span>
        </div>
      </div>
    </Link>
  )
}
