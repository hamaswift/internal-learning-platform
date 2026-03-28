import { createClient } from '@/lib/supabase/server'
import { ReplyForm } from './ReplyForm'
import { DeleteCommentButton } from './DeleteCommentButton'

type Props = {
  lessonId: string
  courseId: string
  currentUserId: string
}

export async function CommentList({ lessonId, courseId, currentUserId }: Props) {
  const supabase = await createClient()

  // DB 側でトップレベルと返信を分けて並列取得し、JS の filter を排除
  const [{ data: topLevel }, { data: replies }] = await Promise.all([
    supabase
      .from('comments')
      .select('id, body, created_at, user_id, profiles ( full_name )')
      .eq('lesson_id', lessonId)
      .is('parent_id', null)
      .order('created_at'),
    supabase
      .from('comments')
      .select('id, body, created_at, parent_id, user_id, profiles ( full_name )')
      .eq('lesson_id', lessonId)
      .not('parent_id', 'is', null)
      .order('parent_id')
      .order('created_at'),
  ])

  if (!topLevel || topLevel.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-500">
        まだコメントはありません
      </p>
    )
  }

  const repliesMap = (replies ?? []).reduce<Record<string, NonNullable<typeof replies>>>((acc, r) => {
    if (!r.parent_id) return acc
    if (!acc[r.parent_id]) acc[r.parent_id] = []
    acc[r.parent_id].push(r)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {topLevel.map((comment) => {
        const profile = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles
        const commentReplies = repliesMap[comment.id] ?? []

        return (
          <div key={comment.id}>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">
                    {profile?.full_name ?? '名無し'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {comment.created_at ? new Date(comment.created_at).toLocaleDateString('ja-JP') : ''}
                  </span>
                  {comment.user_id === currentUserId && (
                    <DeleteCommentButton
                      commentId={comment.id}
                      lessonId={lessonId}
                      courseId={courseId}
                    />
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
                <div className="mt-2">
                  <ReplyForm lessonId={lessonId} courseId={courseId} parentId={comment.id} />
                </div>
              </div>
            </div>

            {/* 返信スレッド */}
            {commentReplies.length > 0 && (
              <div className="ml-11 mt-3 space-y-3 border-l-2 border-gray-100 pl-4">
                {commentReplies.map((reply) => {
                  const replyProfile = Array.isArray(reply.profiles) ? reply.profiles[0] : reply.profiles
                  return (
                    <div key={reply.id} className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                        {replyProfile?.full_name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-800">
                            {replyProfile?.full_name ?? '名無し'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {reply.created_at ? new Date(reply.created_at).toLocaleDateString('ja-JP') : ''}
                          </span>
                          {reply.user_id === currentUserId && (
                            <DeleteCommentButton
                              commentId={reply.id}
                              lessonId={lessonId}
                              courseId={courseId}
                            />
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-gray-700 whitespace-pre-wrap">{reply.body}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
