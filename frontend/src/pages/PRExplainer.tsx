import { useState } from 'react'
import {
  AlertTriangle, Info, Layers, Sparkles,
  Github, Gitlab, Hash,
} from 'lucide-react'
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
      <div className="max-w-2xl">
        <p className="eyebrow flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Pull request insights
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">PR Explainer</h1>
        <p className="mt-2 text-[15px] text-ink-300">
          AI summary, risk score, and risky file highlights for any pull request.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="label mb-0 inline-flex items-center">Provider</span>
          <div className="segmented">
            {(['github', 'gitlab'] as Provider[]).map(p => (
              <button key={p} type="button" onClick={() => setProvider(p)} data-active={provider === p}>
                {p === 'github' ? <Github className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> : <Gitlab className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                {p === 'github' ? 'GitHub' : 'GitLab'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="pr-repo">Repository</label>
            <div className="relative">
              <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
              <input id="pr-repo" value={repo} onChange={e => setRepo(e.target.value)}
                placeholder="owner/repository" className="input pl-10" disabled={isPending} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="pr-number">PR / MR Number</label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
              <input id="pr-number" value={prNumber} onChange={e => setPrNumber(e.target.value)}
                placeholder="e.g. 42" type="number" className="input pl-10" disabled={isPending} />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-2.5"
          disabled={isPending || !repo.trim() || !prNumber.trim()}>
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
              Analyzing…
            </span>
          ) : 'Explain PR'}
        </button>
      </form>

      {isPending && <Spinner message="Fetching PR and running AI analysis…" />}
      {error && (
        <div className="card-danger px-4 py-3 text-sm text-red-200">
          {(error as Error).message}
        </div>
      )}

      {data && (
        <div className="space-y-5 animate-fade-up">
          <div className="card p-6 flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <p className="mono text-xs text-ink-500 mb-2">{data.repo} · PR #{data.pr_number}</p>
              <h2 className="font-display font-semibold text-white text-xl tracking-tight mb-1.5">{data.title}</h2>
              <p className="text-sm text-ink-400">by {data.author}</p>
            </div>
            <RiskScore score={data.risk_score} />
          </div>

          <div className="card p-6">
            <h3 className="flex items-center gap-2.5 font-display font-semibold text-white tracking-tight mb-3">
              <span className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center">
                <Info className="w-4 h-4 text-sky-300" />
              </span>
              Summary
            </h3>
            <p className="text-sm leading-relaxed text-ink-300">{data.summary.summary}</p>
          </div>

          <div className="card p-6">
            <h3 className="flex items-center gap-2.5 font-display font-semibold text-white tracking-tight mb-3">
              <span className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/25 flex items-center justify-center">
                <Layers className="w-4 h-4 text-violet-300" />
              </span>
              Architecture Impact
            </h3>
            <p className="text-sm leading-relaxed text-ink-300">{data.summary.architecture_impact}</p>
          </div>

          {data.summary.risky_files.length > 0 && (
            <div className="card p-6">
              <h3 className="flex items-center gap-2.5 font-display font-semibold text-white tracking-tight mb-4">
                <span className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-rose-300" />
                </span>
                Risky Files
                <span className="ml-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[11px] font-semibold text-rose-300">
                  {data.summary.risky_files.length}
                </span>
              </h3>
              <ul className="space-y-2.5">
                {data.summary.risky_files.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-lg border border-ink-700/50 bg-ink-900/60 px-4 py-3">
                    <span className="mt-0.5 flex-shrink-0"><SeverityBadge severity={f.severity} /></span>
                    <div className="min-w-0">
                      <p className="mono text-[13px] text-ink-100 break-all">{f.file}</p>
                      <p className="text-xs text-ink-400 mt-1 leading-relaxed">{f.reason}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card-hint p-6">
            <h3 className="flex items-center gap-2.5 font-display font-semibold text-brand-200 tracking-tight mb-2">
              <span className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand-300" />
              </span>
              Onboarding tip
            </h3>
            <p className="text-sm leading-relaxed text-ink-200">{data.summary.onboarding_tip}</p>
          </div>

          <div className="card p-6">
            <h3 className="font-display font-semibold text-white tracking-tight mb-3">
              Changed Files
              <span className="ml-2 rounded-full bg-ink-800 border border-ink-700 px-2 py-0.5 text-[11px] font-semibold text-ink-400">
                {data.changed_files.length}
              </span>
            </h3>
            <ul className="space-y-1 max-h-52 overflow-y-auto pr-1">
              {data.changed_files.map((f, i) => (
                <li key={i} className="mono text-xs text-ink-400 leading-6 border-b border-ink-800/70 last:border-0">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
