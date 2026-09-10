import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'
export type StyleFamily = 'modern' | 'classical'

interface SettingsStore {
  theme: ThemeMode
  style: StyleFamily
  setTheme: (theme: ThemeMode) => void
  setStyle: (style: StyleFamily) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'system',
      style: 'modern',
      setTheme: (theme) => set({ theme }),
      setStyle: (style) => set({ style }),
    }),
    { name: 'liuyao-settings' },
  ),
)
