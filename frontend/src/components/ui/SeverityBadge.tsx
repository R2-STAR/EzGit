import type { Severity } from '../../types'

const classes: Record<Severity, string> = {
  critical: 'bg-red-900/60 text-red-300 border border-red-700',
  high:     'bg-orange-900/60 text-orange-300 border border-orange-700',
  medium:   'bg-yellow-900/60 text-yellow-300 border border-yellow-700',
  low:      'bg-blue-900/60 text-blue-300 border border-blue-700',
  info:     'bg-gray-800 text-gray-400 border border-gray-700',
}

export default function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${classes[severity]}`}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  )
}
