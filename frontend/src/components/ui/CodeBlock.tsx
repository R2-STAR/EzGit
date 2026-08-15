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
    <div className="rounded-xl border border-ink-700/60 overflow-hidden bg-ink-925 shadow-card">
      <div className="flex items-center justify-between px-4 py-2.5 bg-ink-850 border-b border-ink-700/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex gap-1.5 flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-ink-600" />
            <span className="w-2.5 h-2.5 rounded-full bg-ink-600" />
            <span className="w-2.5 h-2.5 rounded-full bg-ink-600" />
          </div>
          {filename && <span className="mono text-xs text-ink-400 truncate">{filename}</span>}
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {language && (
            <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-ink-500 border border-ink-700 rounded px-1.5 py-0.5">
              {language}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-medium text-ink-400 hover:text-ink-100 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="overflow-auto" style={{ maxHeight }}>
        <pre className="p-4 text-[13px] font-mono text-ink-200 leading-relaxed whitespace-pre-wrap break-words">
          {code}
        </pre>
      </div>
    </div>
  )
}
