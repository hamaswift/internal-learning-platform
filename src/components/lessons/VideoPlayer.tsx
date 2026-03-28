'use client'

type Props = {
  url: string
  title?: string
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/)
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }

  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  // すでに embed URL の場合はそのまま返す
  if (url.includes('/embed/') || url.includes('player.vimeo.com')) {
    return url
  }

  return null
}

export function VideoPlayer({ url, title }: Props) {
  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-zinc-100 text-sm text-zinc-400">
        動画URLが無効です
      </div>
    )
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        src={embedUrl}
        title={title ?? 'レッスン動画'}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
