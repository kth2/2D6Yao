import { useState } from 'react'
import { NavTabs, type NavKey } from './NavTabs'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '@/hooks/useTheme'
import { SetupPanel } from '@/components/setup/SetupPanel'
import { ChartView } from '@/components/chart/ChartView'
import { HistoryList } from '@/components/history/HistoryList'
import { PromptPreview } from '@/components/interpretation/PromptPreview'

export function AppShell() {
  useTheme()
  const [tab, setTab] = useState<NavKey>('setup')

  return (
    <div className="mx-auto flex min-h-svh max-w-4xl flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-medium">六爻预测</h1>
        <ThemeToggle />
      </header>
      <NavTabs value={tab} onChange={setTab} />
      <main className="flex-1 px-4 py-4">
        {tab === 'setup' && <SetupPanel onGenerated={() => setTab('chart')} />}
        {tab === 'chart' && <ChartView />}
        {tab === 'interpretation' && <PromptPreview />}
        {tab === 'history' && <HistoryList />}
      </main>
    </div>
  )
}
