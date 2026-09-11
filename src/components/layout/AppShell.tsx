import { useState } from 'react'
import { NavTabs, type NavKey } from './NavTabs'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '@/hooks/useTheme'
import { SetupPanel } from '@/components/setup/SetupPanel'
import { ChartView } from '@/components/chart/ChartView'
import { HistoryList } from '@/components/history/HistoryList'
import { InterpretationPanel } from '@/components/interpretation/InterpretationPanel'
import { AiSettingsPanel } from '@/components/settings/AiSettingsPanel'

export function AppShell() {
  useTheme()
  const [tab, setTab] = useState<NavKey>('setup')

  return (
    <div className="mx-auto flex min-h-svh max-w-4xl flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {/* public/ 下的资源要带 BASE_URL，子目录部署才找得到。 */}
          <img
            src={`${import.meta.env.BASE_URL}mark.svg`}
            alt=""
            className="size-8 rounded-lg border border-border"
          />
          <h1 className="text-lg font-medium">六爻预测</h1>
        </div>
        <ThemeToggle />
      </header>
      <NavTabs value={tab} onChange={setTab} />
      <main className="flex-1 px-4 py-4">
        {tab === 'setup' && <SetupPanel onGenerated={() => setTab('chart')} />}
        {tab === 'chart' && <ChartView />}
        {tab === 'interpretation' && <InterpretationPanel />}
        {tab === 'history' && <HistoryList />}
        {tab === 'settings' && <AiSettingsPanel />}
      </main>
    </div>
  )
}
