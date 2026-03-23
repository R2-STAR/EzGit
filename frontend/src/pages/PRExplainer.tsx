import { useState } from 'react'
import { GitPullRequest, AlertTriangle, Info, Layers } from 'lucide-react'
import { usePRExplain } from '../hooks/usePRExplain'
import RiskScore from '../components/ui/RiskScore'
import SeverityBadge from '../components/ui/SeverityBadge'
import Spinner from '../components/ui/Spinner'
import type { Provider } from '../types'

export default function PRExplainer() {
  const [repo, setRepo]         = useState('')
  const [prNumber, setPrNumber] = useState('')
  const [provider, setProvider] = useState<Provider>('github')
  const { mutate, data, isPending, error } = usePRExplain()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (repo.trim() && prNumber.trim())
      mutate({ repo: repo.trim(), prNumber: parseInt(prNumber), provider })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <GitPullRequest className="w-6 h-6 text-purple-400"/> PR Explainer
        </h1>
        <p className="text-gray-400 mt-1">AI summary, risk score, and risky file highlights for any pull request.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="flex gap-2">
          {(['github', 'gitlab'] as Provider[]).map(p => (
            <button key={p} type="button" onClick={() => setProvider(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                provider === p ? 'bg-brand-500 border-brand-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
              }`}>
              {p === 'github' ? 'GitHub' : 'GitLab'}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Repository</label>
            <input value={repo} onChange={e => setRepo(e.target.value)}
              placeholder="owner/repository" className="input" disabled={isPending}/>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">PR / MR Number</label>
            <input value={prNumber} onChange={e => setPrNumber(e.target.value)}
              placeholder="e.g. 42" type="number" className="input" disabled={isPending}/>
          </div>
        </div>
        <button type="submit" className="btn-primary w-full"
          disabled={isPending || !repo.trim() || !prNumber.trim()}>
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              Analyzing…
            </span>
          ) : 'Explain PR'}
        </button>
      </form>

      {isPending && <Spinner message="Fetching PR and running AI analysis…"/>}
      {error && <div className="card border-red-800 bg-red-900/20 text-red-300 text-sm">{(error as Error).message}</div>}

      {data && (
        <div className="space-y-5">
          <div className="card flex items-start justify-between gap-6">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">{data.repo} · PR #{data.pr_number}</p>
              <h2 className="text-lg font-semibold text-white mb-1">{data.title}</h2>
              <p className="text-gray-400 text-sm">by {data.author}</p>
            </div>
            <RiskScore score={data.risk_score}/>
          </div>
          <div className="card space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-2"><Info className="w-4 h-4 text-blue-400"/> Summary</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{data.summary.summary}</p>
          </div>
          <div className="card space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-2"><Layers className="w-4 h-4 text-purple-400"/> Architecture Impact</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{data.summary.architecture_impact}</p>
          </div>
          {data.summary.risky_files.length > 0 && (
            <div className="card space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400"/> Risky Files ({data.summary.risky_files.length})
              </h3>
              {data.summary.risky_files.map((f, i) => (
                <div key={i} className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
                  <SeverityBadge severity={f.severity}/>
                  <div>
                    <p className="text-sm font-mono text-gray-200">{f.file}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="card border-brand-500/30 bg-brand-500/5">
            <h3 className="font-semibold text-brand-400 mb-2">Onboarding tip</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{data.summary.onboarding_tip}</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-white mb-3">Changed Files ({data.changed_files.length})</h3>
            <ul className="space-y-1 max-h-48 overflow-y-auto">
              {data.changed_files.map((f, i) => <li key={i} className="text-xs font-mono text-gray-400">{f}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
