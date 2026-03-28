'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

type Props = {
  name: string
  defaultValue?: string
}

export function MarkdownEditor({ name, defaultValue = '' }: Props) {
  const [value, setValue] = useState(defaultValue)

  return (
    <div>
      <MDEditor
        value={value}
        onChange={(val) => setValue(val ?? '')}
        height={400}
        data-color-mode="light"
      />
      <input type="hidden" name={name} value={value} />
    </div>
  )
}
