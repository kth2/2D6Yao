import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { emptyAiConfig, type AiConfig } from '@/engine/aiProvider'

export type ThemeMode = 'light' | 'dark' | 'system'
export type StyleFamily = 'modern' | 'classical'

interface SettingsStore {
  theme: ThemeMode
  style: StyleFamily
  /** 接口地址、密钥与模型，只存在本机浏览器里，不随卦盘保存。 */
  ai: AiConfig
  setTheme: (theme: ThemeMode) => void
  setStyle: (style: StyleFamily) => void
  setAi: (patch: Partial<AiConfig>) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'system',
      style: 'modern',
      ai: emptyAiConfig,
      setTheme: (theme) => set({ theme }),
      setStyle: (style) => set({ style }),
      setAi: (patch) => set((state) => ({ ai: { ...state.ai, ...patch } })),
    }),
    {
      name: 'liuyao-settings',
      version: 2,
      // v1 存的是单一 Anthropic key/model，换成了多服务商配置；主题偏好照旧保留。
      migrate: (persisted, version) => {
        const state = persisted as Partial<SettingsStore>
        return version < 2 ? { ...state, ai: emptyAiConfig } : state
      },
    },
  ),
)
