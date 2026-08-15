import { useState } from 'react'
import {
  BookOpen, Folder, Zap, Terminal, Code2, Sparkles, Github, Gitlab, Rocket,
} from 'lucide-react'
import { useArchitecture, useLocalSetup } from '../hooks/useOnboard'
import CodeBlock from '../components/ui/CodeBlock'
import Spinner from '../components/ui/Spinner'
import type { Provider } from '../types'

export default function Onboard() {
  const [repo, setRepo]       = useState('')
  const [provider, setProvider] = useState<Provider>('github')
  const [submitted, setSubmitted] = useState('')

  const { mutate: analyzeArch, data: arch, isPending: loadingArch, error: archError } = useArchitecture()
  const { mutate: getSetup, data: setup, isPending: loadingSetup } = useLocalSetup()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const r = repo.trim()
    if (!r) return
    setSubmitted(r)
    analyzeArch({ repo: r, provider })
  }

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <p className="eyebrow flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Repo onboarding
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">Onboarding</h1>
        <p className="mt-2 text-[15px] text-ink-300">
          Understand any codebase in minutes - architecture, key directories, and local setup.
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
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input value={repo} onChange={e => setRepo(e.target.value)}
              placeholder="owner/repository" className="input pl-10" disabled={loadingArch} />
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap px-5" disabled={loadingArch || !repo.trim()}>
            {loadingArch
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />Analyzing…</span>
              : 'Analyze Repo'}
          </button>
        </div>
      </form>

      {archError && (
        <div className="card-danger px-4 py-3 text-sm text-red-200">
          {(archError as Error).message}
        </div>
      )}
      {loadingArch && <Spinner message="Fetching repo structure and running AI analysis…" />}

      {arch && (
        <div className="space-y-5 animate-fade-up">
          <div className="card p-6 space-y-4">
            <h2 className="flex items-center gap-2.5 font-display font-semibold text-white tracking-tight">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-300" />
              </span>
              Overview
            </h2>
            <p className="text-sm leading-relaxed text-ink-300">{arch.overview}</p>
            <div className="flex gap-2 flex-wrap">
              {arch.tech_stack.map(tech => (
                <span key={tech} className="chip">{tech}</span>
              ))}
            </div>
          </div>

          <div className="card p-6 space-y-3">
            <h2 className="flex items-center gap-2.5 font-display font-semibold text-white tracking-tight">
              <span className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center">
                <Folder className="w-4 h-4 text-yellow-300" />
              </span>
              Important Directories
            </h2>
            <ul className="space-y-2">
              {arch.important_directories.map(dir => (
                <li key={dir.path} className="flex items-start gap-3 rounded-lg border border-ink-700/50 bg-ink-900/60 px-4 py-3">
                  <span className="mono text-[13px] text-yellow-300 whitespace-nowrap mt-0.5">{dir.path}</span>
                  <span className="text-sm text-ink-400 leading-relaxed">{dir.purpose}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 space-y-3">
            <h2 className="flex items-center gap-2.5 font-display font-semibold text-white tracking-tight">
              <span className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-sky-300" />
              </span>
              Entry Points
            </h2>
            <div className="flex gap-2 flex-wrap">
              {arch.entry_points.map(ep => (
                <span key={ep} className="chip mono text-sky-300 border-sky-500/25 bg-sky-500/[0.07]">{ep}</span>
              ))}
            </div>
          </div>

          <div className="card-success p-6">
            <h2 className="flex items-center gap-2.5 font-display font-semibold text-emerald-200 tracking-tight mb-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-emerald-300" />
              </span>
              Quick Start
            </h2>
            <p className="text-sm leading-relaxed text-ink-300">{arch.quick_start}</p>
          </div>

          {!setup && (
            <div>
              <button onClick={() => getSetup(submitted)} className="btn-secondary flex items-center gap-2" disabled={loadingSetup}>
                <Rocket className="w-4 h-4" />
                {loadingSetup ? 'Generating setup…' : 'Generate Local Setup (docker-compose + Makefile)'}
              </button>
            </div>
          )}

          {loadingSetup && <Spinner message="Generating tailored local environment…" />}

          {setup && (
            <div className="space-y-5">
              <div className="card-hint p-6">
                <h2 className="flex items-center gap-2.5 font-display font-semibold text-brand-200 tracking-tight mb-3">
                  <span className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
                    <Terminal className="w-4 h-4 text-brand-300" />
                  </span>
                  Local Environment Setup
                </h2>
                <p className="text-sm text-ink-400 mb-4">
                  Detected: <span className="text-white font-medium">{setup.language}</span>
                  <span className="mx-1.5 text-ink-600">·</span>
                  <span className="text-white font-medium">{setup.framework}</span>
                </p>
                <ol className="space-y-2 list-none">
                  {setup.instructions.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-ink-300">
                      <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md bg-brand-500/15 border border-brand-500/25 text-brand-300 font-display font-semibold text-[12px] flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <CodeBlock code={setup.docker_compose} language="yaml" filename="docker-compose.yml" />
              <CodeBlock code={setup.makefile} language="makefile" filename="Makefile" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
