interface Props { score: number; size?: number }

function getColor(s: number) {
  if (s >= 75) return '#ef4444'
  if (s >= 50) return '#f97316'
  if (s >= 25) return '#eab308'
  return '#22c55e'
}

function getLabel(s: number) {
  if (s >= 75) return 'Critical'
  if (s >= 50) return 'High'
  if (s >= 25) return 'Medium'
  return 'Low'
}

export default function RiskScore({ score, size = 80 }: Props) {
  const r = size / 2 - 8
  const circ = 2 * Math.PI * r
  const filled = circ * (score / 100)
  const color = getColor(score)
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1f2937" strokeWidth="8"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}/>
      </svg>
      <div className="text-center -mt-2">
        <div className="text-2xl font-bold" style={{ color }}>{score}</div>
        <div className="text-xs text-gray-400">{getLabel(score)} Risk</div>
      </div>
    </div>
  )
}
