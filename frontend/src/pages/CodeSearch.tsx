import { useState } from 'react'
import { Search, Database, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useSearch, useIndexRepo, useIndexStatus } from '../hooks/useSearch'
import Spinner from '../components/ui/Spinner'

export default function CodeSearch() {
  const [repo, setRepo]         = useState('')
  const [query, setQuery]       = useState('')
  const [activeRepo, setActiveRepo] = useState('')

  const { mutate: search, data, isPending: searching, error: searchError } = useSearch()
  const { mutate: index, isPending: indexing } = useIndexRepo()
  const { data: indexStatus } = useIndexStatus(activeRepo)
  const isIndexed = indexStatus?.status === 'done'

  const handleIndex = () => {
    if (!repo.trim()) return
    setActiveRepo(repo.trim())
    index(repo.trim())
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (repo.trim() && query.trim()) {
      setActiveRepo(repo.trim())
      search({ repo: repo.trim(), query: query.trim() })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-400"/> Code Search
        </h1>
        <p className="text-gray-400 mt-1">Ask in plain English — find exactly which files handle any feature.</p>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2"><Database className="w-4 h-4 text-blue-400"/> Step 1 — Index a repository</h2>
        <div className="flex gap-2">
          <input value={repo} onChange={e => setRepo(e.target.value)} placeholder="owner/repository" className="input" disabled={indexing}/>
          <button onClick={handleIndex} className="btn-secondary whitespace-nowrap" disabled={indexing || !repo.trim()}>
            {indexing ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-gray-500 border-t-gray-200 rounded-full animate-spin"/>Indexing…</span> : 'Index Repo'}
          </button>
        </div>
        {indexStatus && (
          <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${
            indexStatus.status === 'done'     ? 'bg-green-900/20 border-green-800 text-green-400' :
            indexStatus.status === 'indexing' ? 'bg-yellow-900/20 border-yellow-800 text-yellow-400' :
            indexStatus.status === 'error'    ? 'bg-red-900/20 border-red-800 text-red-400' :
            'bg-gray-800 border-gray-700 text-gray-400'
          }`}>
            {indexStatus.status === 'done'     && <CheckCircle className="w-4 h-4"/>}
            {(indexStatus.status === 'indexing' || indexStatus.status === 'pending') && <Clock className="w-4 h-4 animate-pulse"/>}
            {indexStatus.status === 'error'    && <AlertCircle className="w-4 h-4"/>}
            {indexStatus.status === 'done'     ? `Indexed — ${indexStatus.file_count} files, ${indexStatus.chunk_count} chunks` :
             indexStatus.status === 'indexing' ? 'Indexing in progress… auto-refreshing every 3s' :
             indexStatus.status === 'error'    ? 'Indexing failed. Try again.' : 'Not indexed yet'}
          </div>
        )}
      </div>

      <form onSubmit={handleSearch} className="card space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2"><Search className="w-4 h-4 text-blue-400"/> Step 2 — Search</h2>
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="e.g. where is authentication handled?" className="input" disabled={searching || !isIndexed}/>
        <button type="submit" className="btn-primary w-full" disabled={searching || !isIndexed || !query.trim()}>
          {searching ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Searching…</span>
            : isIndexed ? 'Search' : 'Index a repo first'}
        </button>
      </form>

      {searching && <Spinner message="Running semantic search…"/>}
      {searchError && <div className="card border-red-800 bg-red-900/20 text-red-300 text-sm">{(searchError as Error).message}</div>}

      {data && data.results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">{data.total} results for <span className="text-white">"{data.query}"</span></p>
          {data.results.map((hit, i) => (
            <div key={i} className="card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-blue-400">{hit.file_path}</span>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{Math.round(hit.similarity * 100)}% match</span>
              </div>
              <pre className="text-xs font-mono text-gray-400 bg-gray-800/50 rounded p-3 overflow-x-auto whitespace-pre-wrap max-h-40">{hit.chunk_text}</pre>
            </div>
          ))}
        </div>
      )}
      {data && data.results.length === 0 && (
        <div className="card text-center text-gray-400 py-10">No results found. Try rephrasing your query.</div>
      )}
    </div>
  )
}
