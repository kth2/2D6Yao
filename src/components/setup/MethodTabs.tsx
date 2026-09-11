import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type SetupMethod = 'time' | 'coins' | 'yarrow' | 'number' | 'character' | 'manual' | 'pick'

const items: Array<{ key: SetupMethod; label: string }> = [
  { key: 'pick', label: '自排卦象' },
  { key: 'manual', label: '逐爻输入' },
  { key: 'time', label: '按时间起卦' },
  { key: 'coins', label: '投币摇卦' },
  { key: 'yarrow', label: '蓍草揲卦' },
  { key: 'number', label: '数字起卦' },
  { key: 'character', label: '汉字起卦' },
]

export function MethodTabs({
  value,
  onChange,
}: {
  value: SetupMethod
  onChange: (method: SetupMethod) => void
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as SetupMethod)}>
      <TabsList>
        {items.map((item) => (
          <TabsTrigger key={item.key} value={item.key}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
