import { useState } from 'react'
import { ShieldAlert, ShieldCheck, Clock, AlertCircle } from 'lucide-react'
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-400"/> Security Scanner
        </h1>
        <p className="text-gray-400 mt-1">Run Semgrep (SAST) + Snyk (CVEs) with an AI-written security report.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="flex gap-2">
          <input value={repo} onChange={e => setRepo(e.target.value)} placeholder="owner/repository" className="input" disabled={starting || isRunning}/>
          <button type="submit" className="btn-primary whitespace-nowrap" disabled={starting || isRunning || !repo.trim()}>
            {starting ? 'Starting…' : 'Start Scan'}
          </button>
        </div>
        <p className="text-xs text-gray-500">Scans run in background and take 2–10 minutes. Page auto-refreshes.</p>
      </form>

      {startError && <div className="card border-red-800 bg-red-900/20 text-red-300 text-sm">{(startError as Error).message}</div>}

      {isRunning && (
        <div className="card border-yellow-800 bg-yellow-900/10 flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-400 animate-pulse"/>
          <div>
            <p className="text-yellow-400 font-medium">Scan in progress</p>
            <p className="text-xs text-gray-400 mt-0.5">Running Semgrep + Snyk… auto-refreshing every 4s</p>
          </div>
        </div>
      )}

      {isError && (
        <div className="card border-red-800 bg-red-900/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400"/>
          <div>
            <p className="text-red-400 font-medium">Scan failed</p>
            <p className="text-xs text-gray-400">{scanResult?.error_message}</p>
          </div>
        </div>
      )}

      {isDone && (
        <div className="space-y-5">
          <div className="card flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-400"/><span className="font-semibold text-white">Scan Complete</span></div>
            {Object.entries(counts).map(([sev, count]) => (
              <div key={sev} className="flex items-center gap-2">
                <SeverityBadge severity={sev as any}/><span className="text-sm text-gray-300 font-medium">{count}</span>
              </div>
            ))}
            {allFindings.length === 0 && <span className="text-green-400 text-sm">No findings — clean repo!</span>}
          </div>

          {scanResult?.ai_report && (
            <div className="card space-y-3">
              <h3 className="font-semibold text-white">AI Security Report</h3>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{scanResult.ai_report}</pre>
            </div>
          )}

          {allFindings.length > 0 && (
            <div className="card space-y-3">
              <h3 className="font-semibold text-white">All Findings ({allFindings.length})</h3>
              <ul className="space-y-3 max-h-[500px] overflow-y-auto">
                {allFindings.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
                    <SeverityBadge severity={f.severity}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200">{f.message}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap font-mono">
                        <span>{f.file}{f.line ? `:${f.line}` : ''}</span>
                        {f.cve && <span className="text-orange-400">{f.cve}</span>}
                        {f.package && <span>{f.package} {f.version}</span>}
                        {f.fix_version && <span className="text-green-400">fix: {f.fix_version}</span>}
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
