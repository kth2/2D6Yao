import type { ShenshaResult } from '@/engine/shensha'

export function ShenshaList({ shensha }: { shensha: readonly ShenshaResult[] }) {
  if (shensha.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {shensha.map((item) => (
        <span
          key={item.id}
          title={item.detail}
          className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent"
        >
          {item.name} {Array.isArray(item.value) ? item.value.join('') : item.value}
        </span>
      ))}
    </div>
  )
}
