import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

/** 把主题/风格偏好同步到 <html data-theme> / <html data-style>，供 CSS 变量取用。 */
export function useTheme() {
  const theme = useSettingsStore((s) => s.theme)
  const style = useSettingsStore((s) => s.style)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-style', style)
  }, [style])
}
