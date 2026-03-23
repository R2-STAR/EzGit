import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Props {
  code: string
  language?: string
  filename?: string
  maxHeight?: string
}

export default function CodeBlock({ code, language = '', filename, maxHeight = '400px' }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/60 border-b border-gray-800">
        <div className="flex items-center gap-2">
          {filename && <span className="text-xs text-gray-400 font-mono">{filename}</span>}
          {language && <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">{language}</span>}
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-400"/> : <Copy className="w-3.5 h-3.5"/>}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="overflow-auto bg-gray-950" style={{ maxHeight }}>
        <pre className="p-4 text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
          {code}
        </pre>
      </div>
    </div>
  )
}
