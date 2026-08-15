import type { Severity } from '../../types'

const styles: Record<Severity, string> = {
  critical: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  high:     'bg-orange-500/15 text-orange-300 border-orange-500/30',
  medium:   'bg-amber-500/15 text-amber-300 border-amber-500/30',
  low:      'bg-sky-500/15 text-sky-300 border-sky-500/30',
  info:     'bg-ink-800 text-ink-400 border-ink-700',
}

const dots: Record<Severity, string> = {
  critical: 'bg-rose-400',
  high:     'bg-orange-400',
  medium:   'bg-amber-400',
  low:      'bg-sky-400',
  info:     'bg-ink-500',
}

export default function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${styles[severity]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[severity]}`} />
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  )
}
