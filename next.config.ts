import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : ''

// Content Security Policy
const cspHeader = [
  "default-src 'self'",
  // Next.js の HMR・RSC ストリーミングに必要（本番では 'unsafe-inline' 不要だが next.js が自動インライン script を埋め込むため許可）
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  // 画像: 自サイト・Supabase Storage・YouTube/Vimeo サムネイル・data URI
  `img-src 'self' data: blob: ${supabaseHost} img.youtube.com i.vimeocdn.com images.unsplash.com`,
  // 動画埋め込み iframe（YouTube・Vimeo）
  "frame-src https://www.youtube.com https://player.vimeo.com",
  // Supabase API への fetch
  `connect-src 'self' ${supabaseUrl} wss://${supabaseHost}`,
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // HTTPS へのアップグレード（本番のみ有効）
  ...(process.env.NODE_ENV === 'production' ? ["upgrade-insecure-requests"] : []),
].join('; ')

const nextConfig: NextConfig = {
  // X-Powered-By ヘッダーを削除（不要な情報露出を防ぐ）
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },

  images: {
    // next/image で外部URLを最適化（WebP変換・リサイズ）するために許可するドメイン
    remotePatterns: [
      // Supabase Storage（講座サムネイル）
      { protocol: 'https', hostname: '**.supabase.co' },
      // YouTube サムネイル（動画講座のカバー画像用途）
      { protocol: 'https', hostname: 'img.youtube.com' },
      // Vimeo サムネイル
      { protocol: 'https', hostname: 'i.vimeocdn.com' },
      // Unsplash（ダミー画像等）
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
