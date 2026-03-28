# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## プロジェクト概要

社内メンバー限定の学習プラットフォーム。動画・テキスト講座の閲覧・受講ができる。課金機能はMVPスコープ外。

## コマンド

```bash
npm run dev      # 開発サーバー起動（http://localhost:3000）
npm run build    # プロダクションビルド
npm run start    # プロダクションサーバー起動
npm run lint     # ESLint 実行
```

テストランナーは未設定。

## 技術スタック

| 用途 | 技術 |
|------|------|
| フロントエンド | Next.js 16（App Router）|
| スタイリング | Tailwind CSS v4 |
| バックエンド / DB | Supabase（PostgreSQL）|
| 認証 | Supabase Auth（メール＋パスワード）|
| デプロイ | Vercel |

## アーキテクチャ

### ルーティング構成

Route Groups でロール別にレイアウトを分離する。

```
src/
├── app/
│   ├── (auth)/           # 未認証ユーザー向け（ログインページ）
│   ├── (learner)/        # 受講者向けページ
│   ├── (instructor)/     # 講師向けページ
│   ├── (admin)/          # 管理者向けページ
│   └── layout.tsx        # ルートレイアウト
├── components/
│   ├── ui/               # 汎用UIコンポーネント（Button, Input等）
│   ├── courses/          # 講座関連コンポーネント
│   ├── lessons/          # レッスン関連コンポーネント
│   └── comments/         # コメント関連コンポーネント
├── lib/
│   ├── supabase/
│   │   ├── client.ts     # Supabaseクライアント（ブラウザ用）
│   │   └── server.ts     # Supabaseクライアント（サーバー用）
│   └── utils.ts
└── types/
    └── database.ts       # Supabase型定義（自動生成推奨）
```

### 認証・認可

- Supabase Auth でセッション管理。ミドルウェアでロールを検証し、未認証・権限不足はリダイレクト。
- ロールは `public.profiles.role` カラムで管理（`learner` / `instructor` / `admin`）。

### Supabaseクライアントの使い分け

- Server Components / Route Handlers / Middleware → `lib/supabase/server.ts`
- Client Components → `lib/supabase/client.ts`

## DBスキーマ

```sql
-- プロフィール（auth.users と 1:1）
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'learner' check (role in ('learner', 'instructor', 'admin')),
  created_at timestamptz default now()
);

-- カテゴリ
create table public.categories (
  id serial primary key,
  name text not null unique
);

-- 講座
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  category_id int references public.categories(id),
  title text not null,
  description text,
  thumbnail_url text,
  published boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- レッスン
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  content_type text not null check (content_type in ('video', 'text')),
  video_url text,       -- YouTube / Vimeo URL
  body text,            -- テキスト記事（Markdown）
  position int not null default 0,
  created_at timestamptz default now()
);

-- 受講登録
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz default now(),
  unique (user_id, course_id)
);

-- 受講進捗（レッスン単位）
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

-- コメント・質問（parent_id で返信スレッド構造）
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);
```

## ユーザーロールと機能

| ロール | 主な機能 |
|--------|----------|
| 受講者（learner） | 講座一覧・検索、講座詳細、レッスン視聴、受講登録、進捗管理、コメント投稿 |
| 講師（instructor） | 講座・レッスンのCRUD、サムネイル・カテゴリ設定、コメント返信 |
| 管理者（admin） | ユーザー一覧・ロール変更 |

## コンテンツ仕様

- **動画**: YouTube / Vimeo の埋め込みURL（自前アップロードなし）
- **テキスト記事**: Markdown（`body` カラムに保存）

## MVPスコープ外

課金・決済、通知メール、修了証発行、動画の自前アップロード、PWA/モバイルアプリ。

---

## Next.js App Router ベストプラクティス

### Server Components / Client Components の使い分け

- **デフォルトはServer Component**。`layout.tsx` / `page.tsx` は特に宣言不要でサーバー側で動く。
- **`'use client'` を付けるのは**、`useState` / `useEffect` / イベントハンドラ / ブラウザAPIが必要なときだけ。
- `'use client'` を付けると、そのファイルからimportされるすべてのモジュールがクライアントバンドルに含まれる。インタラクティブな部分だけに絞ってバンドルサイズを最小化すること。
- Server ComponentをClient Componentの `children` として渡すことは可能。Context ProviderはClient Componentにしてlayoutで囲む。

### データ取得

- **Server Componentでのデータ取得が基本**。`async/await` で直接DBクエリやfetchを書く。
- 同一コンポーネントツリー内の同一 `fetch` リクエストはReactが自動メモ化する（重複リクエスト不要）。
- **`fetch` はデフォルトでキャッシュされない**。キャッシュしたい場合は `'use cache'` ディレクティブを使う（`next.config.ts` で `cacheComponents: true` を有効化）。
- 並列フェッチが可能な場合は `await` を順番に書かず、`Promise.all` でまとめて開始する。
- Client Componentでのデータ取得にはReactの `use()` APIを使い、Server ComponentからPromiseをpropsで渡してストリーミングする。

### ミューテーション（データ変更）

- データ変更には **Server Functions**（Server Actions）を使う。`'use server'` ディレクティブをファイル先頭またはasync関数内先頭に付ける。
- Server Functionは直接POSTリクエストで呼び出し可能なため、**必ず関数内で認証・認可を検証する**。
- ミューテーション後は `revalidatePath()` または `revalidateTag()` でキャッシュを更新する。リダイレクトが必要な場合は `revalidatePath()` を呼んでから `redirect()` を呼ぶ。
- ペンディング状態の表示には `useActionState` フックを使う。

### ストリーミングとローディングUI

- データ取得を含むコンポーネントは `<Suspense fallback={<Skeleton />}>` で囲み、逐次ストリーミングする。
- ルートセグメント全体のローディングには `loading.tsx` を置く（内部的に `<Suspense>` に変換される）。
- **`loading.tsx` の制約**: layout内でキャッシュされていないデータアクセス（`cookies()` / `headers()` など）がある場合、`loading.tsx` ではなく `<Suspense>` をそのデータアクセス箇所の近くに配置する。

### `params` / `searchParams` の扱い（v16の破壊的変更）

- `params` と `searchParams` は **Promise** になった。必ず `await` してから使う。

```tsx
// ページコンポーネント
export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  // ...
}
```

### 環境変数

- `NEXT_PUBLIC_` プレフィックスがない環境変数はクライアントバンドルに含まれない（空文字になる）。
- Supabase の `service_role` キーなどサーバー専用の秘匿情報は `NEXT_PUBLIC_` を付けない。
- サーバー専用モジュールには `import 'server-only'` を先頭に追加してクライアントへの誤importをビルドエラーで防ぐ。

### ナビゲーション

- `<a>` タグではなく `<Link>` コンポーネント（`next/link`）を使う。
- プログラム的なナビゲーションには `useRouter`（`next/navigation`）を使う（`next/router` ではない）。

---

## Supabase SSR クライアントの作成ルール

参照: https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs

### パッケージ

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 環境変数

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=supabase_publishable_key
```

`service_role` キーはサーバー専用。`NEXT_PUBLIC_` を付けず、クライアントに露出させない。

### クライアントの使い分け

| 実行場所 | クライアント | ファイル |
|----------|-------------|---------|
| Client Components（ブラウザ） | `createBrowserClient` | `lib/supabase/client.ts` |
| Server Components / Server Actions / Route Handlers | `createServerClient` | `lib/supabase/server.ts` |

`createBrowserClient` はシングルトンなので何度呼んでも1インスタンス。
`createServerClient` はリクエストごとに生成する（cookieが変わるため）。

### Proxy（Middleware）の必須設定

Server ComponentはCookieに書き込めないため、**MiddlewareでトークンのリフレッシュとCookie更新を担う**。

- Middlewareで `supabase.auth.getClaims()` を呼び、リフレッシュされたトークンを `request.cookies.set` と `response.cookies.set` で両方にセットする。
- `matcher` でSupabaseにアクセスしないルート（静的ファイル等）はMiddlewareをスキップする。

### 認証チェックのルール（重要）

| API | 用途 | 信頼性 |
|-----|------|--------|
| `supabase.auth.getClaims()` | サーバー側のページ保護・ユーザー認証確認 | **必ず使う** — JWTをプロジェクトの公開鍵で毎回検証する |
| `supabase.auth.getSession()` | サーバーコード内では**使わない** | Cookieをそのまま返すだけでトークン再検証しない |

> サーバーコード（Middleware含む）では必ず `getClaims()` を使うこと。`getSession()` はCookieをそのまま返すだけなので、サーバー側の認証チェックに使うと偽造されたCookieを信頼してしまう危険がある。

### ISR / CDN キャッシュの注意

セッションリフレッシュ時は `Set-Cookie` がレスポンスに含まれる。このレスポンスがキャッシュされると別ユーザーが誤ったセッションを受け取るリスクがある。ISRやCDNを使う場合は認証ページのキャッシュを無効化すること。
