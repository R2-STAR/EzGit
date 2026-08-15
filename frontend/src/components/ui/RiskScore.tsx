interface Props { score: number; size?: number }

const PALETTE = [
  { min: 75, color: '#fb7185', label: 'Critical' },
  { min: 50, color: '#fbbf24', label: 'High' },
  { min: 25, color: '#fde047', label: 'Medium' },
  { min: 0,  color: '#34d399', label: 'Low' },
]

function palette(score: number) {
  return PALETTE.find(p => score >= p.min) ?? PALETTE[PALETTE.length - 1]
}

export default function RiskScore({ score, size = 88 }: Props) {
  const { color, label } = palette(score)
  const r = size / 2 - 10
  const circ = 2 * Math.PI * r
  const filled = circ * Math.min(Math.max(score, 0), 100) / 100

  return (
    <div className="flex flex-col items-center gap-2.5 flex-shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r + 4}
            fill="none" stroke="#37362f" strokeWidth="1"
            strokeDasharray="2 7.8"
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#22221e" strokeWidth="6"
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${filled} ${circ - filled}`}
            style={{
              transition: 'stroke-dasharray 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
              filter: `drop-shadow(0 0 6px ${color}66)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold leading-none tabular-nums" style={{ color, fontSize: size * 0.3 }}>
            {score}
          </span>
        </div>
      </div>
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        {label} risk
      </span>
    </div>
  )
}
