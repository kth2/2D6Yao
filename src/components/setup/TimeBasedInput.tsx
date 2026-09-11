function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function TimeBasedInput({
  date,
  onChange,
}: {
  date: Date
  onChange: (date: Date) => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm">
      <span className="text-text-muted">起卦时间</span>
      <input
        type="datetime-local"
        value={toLocalInputValue(date)}
        onChange={(e) => {
          if (e.target.value) onChange(new Date(e.target.value))
        }}
      />
    </div>
  )
}
