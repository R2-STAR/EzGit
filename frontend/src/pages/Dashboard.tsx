import { GitPullRequest, Search, ShieldAlert, BookOpen, ArrowRight, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const features = [
  {
    to: '/pr',
    icon: GitPullRequest,
    title: 'PR Explainer',
    description: 'AI summary, risk score, and risky file highlights for any pull request.',
    iconColor: 'text-violet-300',
    tile: 'bg-violet-500/10 border-violet-500/25 group-hover:border-violet-400/40',
    bar: 'bg-violet-400',
  },
  {
    to: '/search',
    icon: Search,
    title: 'Code Search',
    description: 'Ask in plain English and find the exact files instantly using vector search.',
    iconColor: 'text-sky-300',
    tile: 'bg-sky-500/10 border-sky-500/25 group-hover:border-sky-400/40',
    bar: 'bg-sky-400',
  },
  {
    to: '/scan',
    icon: ShieldAlert,
    title: 'Security Scan',
    description: 'Run Semgrep + Snyk on any repo and get an AI-written security report.',
    iconColor: 'text-rose-300',
    tile: 'bg-rose-500/10 border-rose-500/25 group-hover:border-rose-400/40',
    bar: 'bg-rose-400',
  },
  {
    to: '/onboard',
    icon: BookOpen,
    title: 'Onboarding',
    description: 'Architecture overview, important directories, and one-command local setup.',
    iconColor: 'text-emerald-300',
    tile: 'bg-emerald-500/10 border-emerald-500/25 group-hover:border-emerald-400/40',
    bar: 'bg-emerald-400',
  },
]

const steps = [
  { n: '1', text: <>Start with <strong className="text-ink-200 font-semibold">Onboarding</strong>, enter any public GitHub repo</> },
  { n: '2', text: <>Use <strong className="text-ink-200 font-semibold">Code Search</strong>, index the repo first, then search</> },
  { n: '3', text: <>Try <strong className="text-ink-200 font-semibold">PR Explainer</strong>, enter a repo and PR number</> },
  { n: '4', text: <>Run a <strong className="text-ink-200 font-semibold">Security Scan</strong>, get a full Semgrep + Snyk report</> },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-12">
      <div className="max-w-2xl">
        <p className="eyebrow flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          AI-powered code intelligence
        </p>
        <h1 className="mt-3 text-4xl font-bold text-white leading-tight">
          Understand any repo,
          <br />
          <span className="text-gradient-amber">in minutes.</span>
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-300">
          Explain pull requests, search code in plain English, scan for vulnerabilities,
          and onboard to new codebases, for your GitHub and GitLab repositories.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {features.map(({ to, icon: Icon, title, description, iconColor, tile, bar }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="card card-interactive group text-left overflow-hidden"
          >
            <span className={`absolute top-0 left-0 right-0 h-[2px] opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${bar}`} />
            <div className="flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${tile}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-semibold text-white tracking-tight">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-300">{description}</p>
              </div>
              <span className="mt-0.5 flex items-center justify-center w-7 h-7 rounded-lg border border-ink-700/70 bg-ink-800 text-ink-500 transition-all duration-200 group-hover:bg-brand-500/15 group-hover:border-brand-500/30 group-hover:text-brand-300">
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="card-hint p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-brand-300" />
          </div>
          <h3 className="font-display font-semibold text-brand-200 tracking-tight">Getting started</h3>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
          {steps.map(({ n, text }) => (
            <li key={n} className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md bg-brand-500/15 border border-brand-500/25 text-brand-300 font-display font-semibold text-[12px] flex items-center justify-center">
                {n}
              </span>
              <span className="text-sm leading-relaxed text-ink-300">{text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
