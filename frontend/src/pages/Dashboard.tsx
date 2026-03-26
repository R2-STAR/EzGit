import { GitPullRequest, Search, ShieldAlert, BookOpen, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const features = [
  { to: '/pr',      icon: GitPullRequest, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', title: 'PR Explainer',     description: 'AI summary, risk score, and risky file highlights for any pull request.' },
  { to: '/search',  icon: Search,         color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',     title: 'Code Search',      description: 'Ask in plain English and find the exact files instantly using vector search.' },
  { to: '/scan',    icon: ShieldAlert,    color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',       title: 'Security Scan',    description: 'Run Semgrep + Snyk on any repo and get an AI-written security report.' },
  { to: '/onboard', icon: BookOpen,       color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',   title: 'Onboarding',       description: 'Architecture overview, important directories, and one-command local setup.' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome to EzGit</h1>
        <p className="mt-2 text-gray-400 text-lg">AI-powered code intelligence for your GitHub and GitLab repositories.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {features.map(({ to, icon: Icon, color, bg, title, description }) => (
          <button key={to} onClick={() => navigate(to)}
            className={`card text-left hover:border-gray-600 transition-all group border ${bg}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`}/>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-white mb-1">{title}</h2>
                <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors mt-1 ml-4 flex-shrink-0"/>
            </div>
          </button>
        ))}
      </div>
      <div className="card border-brand-500/30 bg-brand-500/5">
        <h3 className="font-semibold text-brand-400 mb-2">Getting started</h3>
        <ol className="text-sm text-gray-400 space-y-1.5 list-decimal list-inside">
          <li>Start with <strong className="text-gray-300">Onboarding</strong> — enter any public GitHub repo</li>
          <li>Use <strong className="text-gray-300">Code Search</strong> — index the repo first, then search</li>
          <li>Try <strong className="text-gray-300">PR Explainer</strong> — enter a repo and PR number</li>
          <li>Run a <strong className="text-gray-300">Security Scan</strong> — get a full Semgrep + Snyk report</li>
        </ol>
      </div>
    </div>
  )
}
