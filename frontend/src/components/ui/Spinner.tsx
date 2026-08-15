interface Props { message?: string; size?: 'sm' | 'md' | 'lg' }

const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

export default function Spinner({ message, size = 'md' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3.5 py-10 animate-fade-in">
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-2 border-ink-700`} />
        <div
          className={`${sizes[size]} absolute inset-0 rounded-full animate-spin`}
          style={{ border: '2px solid transparent', borderTopColor: '#e09d3d', borderRightColor: '#e09d3d55' }}
        />
      </div>
      {message && <p className="text-sm text-ink-400">{message}</p>}
    </div>
  )
}
