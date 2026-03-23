import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, GitPullRequest, Search,
  ShieldAlert, BookOpen, Zap,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pr',        icon: GitPullRequest,  label: 'PR Explainer' },
  { to: '/search',    icon: Search,          label: 'Code Search' },
  { to: '/scan',      icon: ShieldAlert,     label: 'Security Scan' },
  { to: '/onboard',   icon: BookOpen,        label: 'Onboarding' },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-800">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">GitAnalyzer</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-500/15 text-brand-400'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800',
                )
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-600">ezGit v1.0.0</p>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-950">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
