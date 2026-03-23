import { useState } from 'react'
import { BookOpen, Folder, Zap, Terminal, Code2 } from 'lucide-react'
import { useArchitecture, useLocalSetup } from '../hooks/useOnboard'
import CodeBlock from '../components/ui/CodeBlock'
import Spinner from '../components/ui/Spinner'
import type { Architecture, LocalSetup, Provider } from '../types'

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
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-green-400"/> Onboarding
        </h1>
        <p className="text-gray-400 mt-1">Understand any codebase in minutes — architecture, key directories, and local setup.</p>
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
        <div className="flex gap-2">
          <input value={repo} onChange={e => setRepo(e.target.value)} placeholder="owner/repository" className="input" disabled={loadingArch}/>
          <button type="submit" className="btn-primary whitespace-nowrap" disabled={loadingArch || !repo.trim()}>
            {loadingArch ? 'Analyzing…' : 'Analyze Repo'}
          </button>
        </div>
      </form>

      {archError && <div className="card border-red-800 bg-red-900/20 text-red-300 text-sm">{(archError as Error).message}</div>}
      {loadingArch && <Spinner message="Fetching repo structure and running AI analysis…"/>}

      {arch && (
        <div className="space-y-5">
          <div className="card space-y-3">
            <h2 className="font-semibold text-white flex items-center gap-2"><Zap className="w-4 h-4 text-green-400"/> Overview</h2>
            <p className="text-gray-300 text-sm leading-relaxed">{arch.overview}</p>
            <div className="flex gap-2 flex-wrap mt-2">
              {arch.tech_stack.map(tech => (
                <span key={tech} className="text-xs bg-gray-800 text-gray-300 border border-gray-700 px-2 py-1 rounded">{tech}</span>
              ))}
            </div>
          </div>

          <div className="card space-y-3">
            <h2 className="font-semibold text-white flex items-center gap-2"><Folder className="w-4 h-4 text-yellow-400"/> Important Directories</h2>
            <ul className="space-y-2">
              {arch.important_directories.map(dir => (
                <li key={dir.path} className="flex items-start gap-3 bg-gray-800/50 rounded-lg px-3 py-2">
                  <span className="font-mono text-sm text-yellow-400 whitespace-nowrap">{dir.path}</span>
                  <span className="text-sm text-gray-400">{dir.purpose}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card space-y-3">
            <h2 className="font-semibold text-white flex items-center gap-2"><Code2 className="w-4 h-4 text-blue-400"/> Entry Points</h2>
            <div className="flex gap-2 flex-wrap">
              {arch.entry_points.map(ep => (
                <span key={ep} className="font-mono text-sm bg-gray-800 text-blue-300 border border-gray-700 px-2 py-1 rounded">{ep}</span>
              ))}
            </div>
          </div>

          <div className="card border-green-500/30 bg-green-500/5">
            <h2 className="font-semibold text-green-400 mb-2 flex items-center gap-2"><Terminal className="w-4 h-4"/> Quick Start</h2>
            <p className="text-sm text-gray-300 leading-relaxed">{arch.quick_start}</p>
          </div>

          {!setup && (
            <button onClick={() => getSetup(submitted)} className="btn-secondary flex items-center gap-2" disabled={loadingSetup}>
              <Terminal className="w-4 h-4"/>
              {loadingSetup ? 'Generating setup…' : 'Generate Local Setup (docker-compose + Makefile)'}
            </button>
          )}

          {loadingSetup && <Spinner message="Generating tailored local environment…"/>}

          {setup && (
            <div className="space-y-5">
              <div className="card border-brand-500/30 bg-brand-500/5">
                <h2 className="font-semibold text-brand-400 mb-3 flex items-center gap-2"><Terminal className="w-4 h-4"/> Local Environment Setup</h2>
                <p className="text-sm text-gray-400 mb-3">Detected: <span className="text-white">{setup.language}</span> · <span className="text-white">{setup.framework}</span></p>
                <ol className="space-y-1.5 list-decimal list-inside text-sm text-gray-300 mb-4">
                  {setup.instructions.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
              <CodeBlock code={setup.docker_compose} language="yaml" filename="docker-compose.yml"/>
              <CodeBlock code={setup.makefile} language="makefile" filename="Makefile"/>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
