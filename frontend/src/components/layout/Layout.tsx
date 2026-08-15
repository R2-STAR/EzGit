import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, GitPullRequest, Search,
  ShieldAlert, BookOpen, Zap, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pr',        icon: GitPullRequest,  label: 'PR Explainer' },
  { to: '/search',    icon: Search,          label: 'Code Search' },
  { to: '/scan',      icon: ShieldAlert,     label: 'Security Scan' },
  { to: '/onboard',   icon: BookOpen,        label: 'Onboarding' },
]

const pageLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pr': 'PR Explainer',
  '/search': 'Code Search',
  '/scan': 'Security Scan',
  '/onboard': 'Onboarding',
}

export default function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="flex h-screen overflow-hidden bg-ink-950">
      <aside className="w-64 flex-shrink-0 bg-ink-925 border-r border-ink-700/60 flex flex-col">
        <div className="px-5 pt-6 pb-5">
          <div className="min-w-0">
            <p className="font-display font-bold text-[19px] text-white tracking-tight leading-none">EzGit</p>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-ink-500">code intelligence</p>
          </div>
        </div>

        <nav className="flex-1 px-3 pt-2 pb-4">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-600">Workspace</p>
          <div className="space-y-0.5">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-150',
                    isActive
                      ? 'text-brand-300'
                      : 'text-ink-400 hover:text-ink-100 hover:bg-ink-800/60',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2.5px] rounded-full bg-brand-400 shadow-[0_0_10px_rgba(224,157,61,0.8)]" />
                    )}
                    <Icon
                      className={clsx(
                        'w-[17px] h-[17px] flex-shrink-0 transition-colors duration-150',
                        isActive ? 'text-brand-400' : 'text-ink-500 group-hover:text-ink-200',
                      )}
                    />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="px-5 py-4 border-t border-ink-700/60">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[11px] font-medium text-ink-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              All systems up
            </span>
            <span className="font-mono text-[11px] text-ink-600">v1.0.0</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 border-b border-ink-700/50 bg-ink-950/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto w-full px-10 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="font-display font-semibold text-ink-300">EzGit</span>
              <ChevronRight className="w-3.5 h-3.5 text-ink-600" />
              <span className="font-medium text-ink-100">{pageLabels[pathname] ?? 'Dashboard'}</span>
            </div>
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-ink-500">
              <Zap className="w-3 h-3 text-brand-400" />
              Gemini-powered analysis
            </span>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto">
          <div className="app-glow pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative max-w-6xl mx-auto w-full px-10 py-10 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <div className="noise-overlay" aria-hidden />
    </div>
  )
}
