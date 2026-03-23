import { useState } from 'react'
import { Search } from 'lucide-react'

interface Props {
  onSubmit: (repo: string) => void
  placeholder?: string
  buttonLabel?: string
  loading?: boolean
  hint?: string
}

export default function RepoInput({ onSubmit, placeholder = 'owner/repository', buttonLabel = 'Analyze', loading = false, hint }: Props) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) onSubmit(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
          <input value={value} onChange={e => setValue(e.target.value)}
            placeholder={placeholder} className="input pl-9" disabled={loading}/>
        </div>
        <button type="submit" className="btn-primary" disabled={loading || !value.trim()}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              Loading…
            </span>
          ) : buttonLabel}
        </button>
      </div>
      {hint && <p className="text-xs text-gray-500 mt-2">{hint}</p>}
    </form>
  )
}
