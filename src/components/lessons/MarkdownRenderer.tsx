import ReactMarkdown from 'react-markdown'

// XSS 対策: 許可する要素を明示的に限定（script・iframe 等を排除）
const ALLOWED_ELEMENTS = [
  'p', 'br',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'em', 'del', 'blockquote',
  'ul', 'ol', 'li',
  'code', 'pre',
  'a', 'img',
  'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
] as const

type Props = {
  content: string
}

export function MarkdownRenderer({ content }: Props) {
  return (
    <div className="prose prose-zinc max-w-none text-sm leading-relaxed">
      <ReactMarkdown allowedElements={[...ALLOWED_ELEMENTS]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
