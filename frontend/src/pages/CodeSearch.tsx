import { useState } from 'react'
import {
  Search, Database, CheckCircle, Clock, AlertCircle, Sparkles, FileCode2,
} from 'lucide-react'
import { useSearch, useIndexRepo, useIndexStatus } from '../hooks/useSearch'
import Spinner from '../components/ui/Spinner'

function normalizeRepo(raw: string): string {
  const r = raw.trim()
  if (!r) return ''
  const m = r.replace(/^git@/, '').match(/github\.com[/:]([^/]+\/[^/?#]+)/i)
  const base = m ? m[1] : r.replace(/^https?:\/\/(www\.)?github\.com\//i, '')
  return base.replace(/\.git$/i, '').split('/').slice(0, 2).join('/')
}

function StepBadge({ n, hue }: { n: string; hue: string }) {
  return (
    <span className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center font-display font-semibold text-[13px] ${hue}`}>
      {n}
    </span>
  )
}

const statusPills: Record<string, { box: string; text: string; icon: typeof Clock | null }> = {
  done:     { box: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300', text: 'text-emerald-300', icon: CheckCircle },
  indexing: { box: 'bg-brand-500/10 border-brand-500/30 text-brand-300', text: 'text-brand-300', icon: Clock },
  pending:  { box: 'bg-brand-500/10 border-brand-500/30 text-brand-300', text: 'text-brand-300', icon: Clock },
  error:    { box: 'bg-rose-500/10 border-rose-500/30 text-rose-300', text: 'text-rose-300', icon: AlertCircle },
  not_indexed: { box: 'bg-ink-800/70 border-ink-700 text-ink-400', text: 'text-ink-400', icon: null },
}

export default function CodeSearch() {
  const [repo, setRepo]         = useState('')
  const [query, setQuery]       = useState('')

  const { mutate: search, data, isPending: searching, error: searchError } = useSearch()
  const { mutate: index, isPending: indexing } = useIndexRepo()

  const current = normalizeRepo(repo)
  const { data: indexStatus } = useIndexStatus(current)
  const isIndexed = indexStatus?.status === 'done'

  const handleIndex = () => {
    if (!current) return
    index(current)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (current && query.trim()) {
      search({ repo: current, query: query.trim() })
    }
  }

  const statusKey = indexStatus?.status ?? 'not_indexed'
  const StatusIcon = statusPills[statusKey].icon

  const statusMessage =
    indexStatus?.status === 'done'     ? `Indexed - ${indexStatus.file_count} files, ${indexStatus.chunk_count} chunks` :
    indexStatus?.status === 'indexing' ? 'Indexing in progress… auto-refreshing every 3s' :
    indexStatus?.status === 'error'    ? (indexStatus.error_message || 'Indexing failed. Try again.') : 'Not indexed yet'

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <p className="eyebrow flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Vector search
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">Code Search</h1>
        <p className="mt-2 text-[15px] text-ink-300">
          Ask in plain English, find exactly which files handle any feature.
        </p>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="flex items-center gap-3 font-display font-semibold text-white tracking-tight">
          <StepBadge n="01" hue="bg-brand-500/15 border-brand-500/30 text-brand-300" />
          Index a repository
        </h2>
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <Database className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input value={repo} onChange={e => setRepo(e.target.value)}
              placeholder="owner/repository or full GitHub URL" className="input pl-10" disabled={indexing} />
          </div>
          <button onClick={handleIndex} className="btn-secondary whitespace-nowrap" disabled={indexing || !current}>
            {indexing
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-ink-500 border-t-ink-200 rounded-full animate-spin" />Indexing…</span>
              : 'Index Repo'}
          </button>
        </div>
        {current && indexStatus && (
          <div className={`flex items-center gap-2.5 text-[13px] px-3.5 py-2.5 rounded-lg border animate-fade-in ${statusPills[statusKey].box}`}>
            {StatusIcon && <StatusIcon className={`w-4 h-4 ${StatusIcon === Clock ? 'animate-pulse' : ''} ${statusPills[statusKey].text}`} />}
            {statusMessage}
          </div>
        )}
      </div>

      <form onSubmit={handleSearch} className="card p-6 space-y-5">
        <h2 className="flex items-center gap-3 font-display font-semibold text-white tracking-tight">
          <StepBadge n="02" hue="bg-sky-500/15 border-sky-500/30 text-sky-300" />
          Search
        </h2>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="e.g. where is authentication handled?" className="input pl-10" disabled={searching || !current || !isIndexed} />
        </div>
        <button type="submit" className="btn-primary w-full py-2.5" disabled={searching || !isIndexed || !query.trim()}>
          {searching
            ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />Searching…</span>
            : !current ? 'Enter a repo first'
            : isIndexed ? 'Search'
            : 'Index a repo first'}
        </button>
        {current && !isIndexed && !searching && (
          <p className="text-xs text-ink-500 text-center">Step 1 must be completed before searching.</p>
        )}
      </form>

      {searching && <Spinner message="Running semantic search…" />}
      {searchError && (
        <div className="card-danger px-4 py-3 text-sm text-red-200">
          {(searchError as Error).message}
        </div>
      )}

      {data && data.results.length > 0 && (
        <div className="space-y-4 animate-fade-up">
          <p className="text-sm text-ink-400">
            {data.total} results for <span className="text-white font-medium">“{data.query}”</span>
          </p>
          {data.results.map((hit, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-5 pt-4">
                <span className="flex items-center gap-2 mono text-[13px] text-sky-300 break-all">
                  <FileCode2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  {hit.file_path}
                </span>
                <span className="flex-shrink-0 rounded-full bg-ink-800 border border-ink-700 px-2 py-0.5 text-[11px] font-medium text-ink-300 tabular-nums">
                  {Math.round(hit.similarity * 100)}% match
                </span>
              </div>
              <pre className="mt-3 mono text-xs leading-relaxed text-ink-300 bg-ink-950/70 px-5 py-4 overflow-x-auto whitespace-pre-wrap max-h-44">
                {hit.chunk_text}
              </pre>
            </div>
          ))}
        </div>
      )}

      {data && data.results.length === 0 && (
        <div className="card px-6 py-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-ink-800/80 border border-ink-700 flex items-center justify-center mb-3">
            <Search className="w-5 h-5 text-ink-500" />
          </div>
          <p className="text-sm text-ink-400">No results found. Try rephrasing your query.</p>
        </div>
      )}
    </div>
  )
}
