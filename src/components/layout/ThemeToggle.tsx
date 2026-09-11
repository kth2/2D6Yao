import { Moon, Palette, Sun, SunMoon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/store/settingsStore'

const themeCycle = ['system', 'light', 'dark'] as const
const themeIcon = { system: SunMoon, light: Sun, dark: Moon }

export function ThemeToggle() {
  const { theme, style, setTheme, setStyle } = useSettingsStore()
  const Icon = themeIcon[theme]

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        title={`主题：${theme}`}
        onClick={() => {
          const next = themeCycle[(themeCycle.indexOf(theme) + 1) % themeCycle.length]
          setTheme(next)
        }}
      >
        <Icon size={18} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title={`风格：${style === 'modern' ? '现代' : '古典'}`}
        onClick={() => setStyle(style === 'modern' ? 'classical' : 'modern')}
      >
        <Palette size={18} />
      </Button>
    </div>
  )
}
