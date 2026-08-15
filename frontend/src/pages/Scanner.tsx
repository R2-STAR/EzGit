import { useState } from 'react'
import {
  ShieldCheck, Clock, AlertCircle, Sparkles, ShieldQuestion,
} from 'lucide-react'
import { useStartScan, useScanResult } from '../hooks/useScan'
import SeverityBadge from '../components/ui/SeverityBadge'
import type { Finding } from '../types'

export default function Scanner() {
  const [repo, setRepo]     = useState('')
  const [scanId, setScanId] = useState<string | null>(null)

  const { mutate: startScan, isPending: starting, error: startError } = useStartScan()
  const { data: scanResult } = useScanResult(scanId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!repo.trim()) return
    startScan(repo.trim(), { onSuccess: res => setScanId(res.scan_id) })
  }

  const isRunning = scanResult?.status === 'pending' || scanResult?.status === 'running'
  const isDone    = scanResult?.status === 'done'
  const isError   = scanResult?.status === 'error'

  const allFindings = [
    ...(scanResult?.semgrep_findings || []),
    ...(scanResult?.snyk_findings || []),
  ].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    return (order[a.severity] ?? 5) - (order[b.severity] ?? 5)
  })

  const counts = allFindings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const severityOrder = ['critical', 'high', 'medium', 'low', 'info']

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <p className="eyebrow flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          SAST + CVE scanning
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">Security Scanner</h1>
        <p className="mt-2 text-[15px] text-ink-300">
          Run Semgrep (SAST) + Snyk (CVEs) with an AI-written security report.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <ShieldQuestion className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input value={repo} onChange={e => setRepo(e.target.value)} placeholder="owner/repository"
              className="input pl-10" disabled={starting || isRunning} />
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap px-5" disabled={starting || isRunning || !repo.trim()}>
            {starting
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />Starting…</span>
              : 'Start Scan'}
          </button>
        </div>
        <p className="flex items-center gap-2 text-xs text-ink-500">
          <Clock className="w-3.5 h-3.5" />
          Scans run in background and take 2-10 minutes. Page auto-refreshes.
        </p>
      </form>

      {startError && (
        <div className="card-danger px-4 py-3 text-sm text-red-200">
          {(startError as Error).message}
        </div>
      )}

      {isRunning && (
        <div className="card-warn p-5 flex items-start gap-4 animate-fade-in">
          <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-300 animate-pulse" />
          </span>
          <div>
            <p className="font-display font-semibold text-amber-200 tracking-tight">Scan in progress</p>
            <p className="text-xs text-ink-400 mt-1 leading-relaxed">
              Running Semgrep + Snyk… auto-refreshing every 4s. This may take a few minutes.
            </p>
          </div>
        </div>
      )}

      {isError && (
        <div className="card-danger p-5 flex items-start gap-4 animate-fade-in">
          <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-rose-300" />
          </span>
          <div>
            <p className="font-display font-semibold text-rose-200 tracking-tight">Scan failed</p>
            <p className="text-xs text-ink-400 mt-1">{scanResult?.error_message}</p>
          </div>
        </div>
      )}

      {isDone && (
        <div className="space-y-5 animate-fade-up">
          <div className="card p-5 flex items-center gap-4 flex-wrap">
            <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </span>
            <span className="font-display font-semibold text-white tracking-tight">Scan Complete</span>
            <span className="hidden sm:block w-px h-6 bg-ink-700" />
            <div className="flex items-center gap-3 flex-wrap">
              {severityOrder.filter(s => counts[s]).map(sev => (
                <span key={sev} className="flex items-center gap-2">
                  <SeverityBadge severity={sev as Finding['severity']} />
                  <span className="text-sm font-semibold text-ink-200">{counts[sev]}</span>
                </span>
              ))}
              {allFindings.length === 0 && (
                <span className="flex items-center gap-2 text-sm text-emerald-300 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  No findings, clean repo!
                </span>
              )}
            </div>
          </div>

          {scanResult?.ai_report && (
            <div className="card p-6">
              <h3 className="flex items-center gap-2.5 font-display font-semibold text-white tracking-tight mb-4">
                <span className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-300" />
                </span>
                AI Security Report
              </h3>
              <pre className="text-sm leading-relaxed text-ink-300 whitespace-pre-wrap font-sans">{scanResult.ai_report}</pre>
            </div>
          )}

          {allFindings.length > 0 && (
            <div className="card p-6">
              <h3 className="font-display font-semibold text-white tracking-tight mb-4">
                All Findings
                <span className="ml-2 rounded-full bg-ink-800 border border-ink-700 px-2 py-0.5 text-[11px] font-semibold text-ink-400">
                  {allFindings.length}
                </span>
              </h3>
              <ul className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {allFindings.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-lg border border-ink-700/50 bg-ink-900/60 px-4 py-3">
                    <span className="mt-0.5 flex-shrink-0"><SeverityBadge severity={f.severity} /></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink-200 leading-relaxed">{f.message}</p>
                      <div className="flex gap-x-4 gap-y-1 mt-1.5 text-xs font-mono text-ink-500 flex-wrap">
                        <span>{f.file}{f.line ? `:${f.line}` : ''}</span>
                        {f.cve && <span className="text-amber-300">{f.cve}</span>}
                        {f.package && <span>{f.package} {f.version}</span>}
                        {f.fix_version && <span className="text-emerald-300">fix: {f.fix_version}</span>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
