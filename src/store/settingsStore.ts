import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { models, type ModelId } from '@/engine/llm'

export type ThemeMode = 'light' | 'dark' | 'system'
export type StyleFamily = 'modern' | 'classical'

interface SettingsStore {
  theme: ThemeMode
  style: StyleFamily
  /** 用户自己的 Anthropic API key，只存在本机浏览器里，不随卦盘保存。 */
  apiKey: string
  model: ModelId
  setTheme: (theme: ThemeMode) => void
  setStyle: (style: StyleFamily) => void
  setApiKey: (apiKey: string) => void
  setModel: (model: ModelId) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'system',
      style: 'modern',
      apiKey: '',
      model: models[0].id,
      setTheme: (theme) => set({ theme }),
      setStyle: (style) => set({ style }),
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
    }),
    { name: 'liuyao-settings' },
  ),
)
