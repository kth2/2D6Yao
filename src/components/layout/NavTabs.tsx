export type NavKey = 'setup' | 'chart' | 'history' | 'interpretation'

const items: Array<{ key: NavKey; label: string }> = [
  { key: 'setup', label: '起卦' },
  { key: 'chart', label: '卦盘' },
  { key: 'interpretation', label: '解卦' },
  { key: 'history', label: '历史' },
]

export function NavTabs({ value, onChange }: { value: NavKey; onChange: (key: NavKey) => void }) {
  return (
    <nav className="flex gap-1 border-b border-border px-4">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={
            'border-b-2 px-3 py-2 text-sm transition-colors ' +
            (value === item.key
              ? 'border-accent text-text'
              : 'border-transparent text-text-muted hover:text-text')
          }
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
