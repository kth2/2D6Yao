import { create } from 'zustand'
import { db, readingTitle, type SavedReading } from '@/db/db'
import type { AiConfig } from '@/engine/aiProvider'
import {
  benchmarkCases,
  classifyFailure,
  type BenchmarkResult,
  type BenchmarkRun,
  type Failure,
} from '@/engine/benchmark'
import { loadCases, loadRules, type CorpusCase } from '@/engine/corpus'
import { streamReading } from '@/engine/llm'
import { buildReadingPrompt, computeEvidence } from '@/engine/readingContext'
import { parseVerdict } from '@/engine/verdict'
import { appVersion } from '@/lib/appVersion'
import { keepScreenAwake } from '@/lib/wakeLock'

/** 两次调用之间稍停：免费档多半有每分钟次数限制。 */
const pauseMs = 1500
/** 单道题最长等多久。带思考的模型慢，但卡住三分钟就不是慢了。 */
const callTimeoutMs = 180_000
/** 每分钟限额没给建议等待时间时，等这么久再试。 */
const defaultRateWaitMs = 65_000
/** 同一道题最多试几次（限额、断网、超时都算一次）。 */
const maxAttempts = 3

const failureLabels: Record<Failure['kind'], string> = {
  rate: '触发每分钟限额',
  quota: '今天的额度用完了',
  auth: '密钥无效或没有权限',
  timeout: '等了太久没有回应',
  network: '网络中断（手机切到后台或锁屏也会这样）',
  other: '出错',
}

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      resolve()
    })
  })

interface BenchmarkStore {
  runningId: number | null
  current: string
  done: number
  total: number
  error: string
  controller: AbortController | null
  /** 新开一轮；已在跑就不动。 */
  start: (ai: AiConfig) => Promise<void>
  /** 接着跑一轮没跑完的（中途停了、页面被关、或额度用完第二天再跑）。 */
  resume: (runId: number, ai: AiConfig) => Promise<void>
  stop: () => void
}

/**
 * 回测跑在模块级的 store 里，而不是组件里：几十卦要跑十几分钟，中途切页面也不该断。
 * 每一步都写回数据库 —— 页面万一被系统杀掉，重开后能看到跑到哪、为什么断，点「继续」接着跑。
 */
export const useBenchmarkStore = create<BenchmarkStore>((set, get) => {
  /** 断一道题：超时就中止这一次请求，但不影响整轮。 */
  async function judge(prompt: string, ai: AiConfig, runSignal: AbortSignal): Promise<string> {
    const call = new AbortController()
    const onRunAbort = () => call.abort()
    runSignal.addEventListener('abort', onRunAbort)
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      call.abort()
    }, callTimeoutMs)
    try {
      let answer = ''
      await streamReading(
        { config: ai, messages: [{ role: 'user', content: prompt }], signal: call.signal },
        { onThinking: () => {}, onText: (delta) => (answer += delta) },
      )
      return answer
    } catch (cause) {
      if (timedOut) {
        throw Object.assign(new Error(`超过 ${callTimeoutMs / 1000} 秒没有回应`), { name: 'TimeoutError' })
      }
      throw cause
    } finally {
      clearTimeout(timer)
      runSignal.removeEventListener('abort', onRunAbort)
    }
  }

  async function run(runId: number, ai: AiConfig) {
    const controller = new AbortController()
    const release = keepScreenAwake()
    set({ runningId: runId, controller, error: '', current: '准备中' })
    const touch = (patch: Partial<BenchmarkRun> = {}) =>
      db.runs.update(runId, { lastActivityAt: Date.now(), ...patch })

    try {
      await touch({ lastError: undefined })
      const rules = await loadRules()
      // 书例库 1.8MB，弱网下可能载不下来：那就不带书例跑，并记一笔，免得和带书例的轮次混着比。
      let corpus: CorpusCase[] | null = null
      try {
        corpus = await loadCases()
      } catch {
        const record = await db.runs.get(runId)
        const note = '书例库没能载入，本轮不带相似书例'
        if (record && !record.notes?.includes(note)) {
          await db.runs.update(runId, { notes: [...(record.notes ?? []), note] })
        }
      }

      const record = await db.runs.get(runId)
      if (!record) return
      const readings = (await db.readings.bulkGet(record.caseIds)).filter(
        (reading): reading is SavedReading => reading !== undefined,
      )
      // 跑过且没出错的跳过，出错的重跑。
      const finished = new Set(record.results.filter((r) => !r.error).map((r) => r.readingId))
      set({ total: record.caseIds.length, done: finished.size })

      for (const reading of readings) {
        if (controller.signal.aborted) break
        if (reading.id === undefined || finished.has(reading.id) || !reading.outcome?.actual) continue
        const question = reading.question || reading.label || ''
        const title = readingTitle(reading)

        // 回测不并入本机战绩与复盘修正：那些是用这批题的答案算出来的，等于拿答案考自己。
        const bundle = computeEvidence({
          chart: reading.chart,
          question,
          chapter: reading.chapter || undefined,
          rules,
        })
        const { prompt } = buildReadingPrompt(reading.chart, question, bundle, {
          cases: corpus,
          blind: true,
        })

        let result: BenchmarkResult | null = null
        let stopReason = ''
        for (let attempt = 1; attempt <= maxAttempts && !controller.signal.aborted; attempt++) {
          set({ current: `${title}${attempt > 1 ? `（第 ${attempt} 次）` : ''}` })
          await touch()
          try {
            const answer = await judge(prompt, ai, controller.signal)
            result = {
              readingId: reading.id,
              verdict: parseVerdict(answer),
              actual: reading.outcome.actual,
              answer,
            }
            break
          } catch (cause) {
            if (controller.signal.aborted) break
            const failure = classifyFailure(cause)
            const reason = `${failureLabels[failure.kind]}：${failure.message.slice(0, 160)}`
            if (failure.kind === 'quota' || failure.kind === 'auth') {
              stopReason = reason
              break
            }
            if (failure.kind === 'other' || attempt === maxAttempts) {
              result = {
                readingId: reading.id,
                verdict: null,
                actual: reading.outcome.actual,
                answer: '',
                error: reason,
              }
              // 限额、断网、超时连试几次都不行，多半不是这一道的问题，先停下。
              if (failure.kind !== 'other') stopReason = reason
              break
            }
            const wait =
              failure.kind === 'rate'
                ? Math.min(Math.max(failure.retryAfterMs ?? defaultRateWaitMs, 5_000), 120_000)
                : 5_000
            set({ current: `${title} —— ${failureLabels[failure.kind]}，${Math.round(wait / 1000)} 秒后自动重试` })
            await sleep(wait, controller.signal)
          }
        }

        if (result) {
          await saveResult(runId, result)
          if (!result.error) set((state) => ({ done: state.done + 1 }))
        }
        if (stopReason) {
          await touch({ lastError: stopReason })
          set({ error: `已暂停 —— ${stopReason}。解决之后点「继续」接着跑。` })
          break
        }
        await sleep(pauseMs, controller.signal)
      }

      const latest = await db.runs.get(runId)
      if (latest && latest.results.filter((r) => !r.error).length >= latest.caseIds.length) {
        await touch({ finishedAt: Date.now(), lastError: undefined })
      } else if (controller.signal.aborted) {
        await touch({ lastError: '手动停止' })
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause)
      await touch({ lastError: message }).catch(() => {})
      set({ error: `回测中断：${message}` })
    } finally {
      release()
      set({ runningId: null, controller: null, current: '' })
    }
  }

  return {
    runningId: null,
    current: '',
    done: 0,
    total: 0,
    error: '',
    controller: null,
    start: async (ai) => {
      if (get().runningId !== null) return
      const readings = await db.readings.toArray()
      const cases = benchmarkCases(readings)
      if (cases.length === 0) return
      const runId = await db.runs.add({
        startedAt: Date.now(),
        model: ai.model,
        provider: ai.presetId,
        appVersion,
        caseIds: cases.map((reading) => reading.id as number),
        results: [],
      } satisfies BenchmarkRun)
      if (runId !== undefined) await run(runId, ai)
    },
    resume: async (runId, ai) => {
      if (get().runningId !== null) return
      await run(runId, ai)
    },
    stop: () => get().controller?.abort(),
  }
})

/** 同一卦重跑时替换旧结果，不重复累加。 */
async function saveResult(runId: number, result: BenchmarkResult) {
  await db.transaction('rw', db.runs, async () => {
    const run = await db.runs.get(runId)
    if (!run) return
    const results = run.results.filter((item) => item.readingId !== result.readingId)
    await db.runs.update(runId, { results: [...results, result], lastActivityAt: Date.now() })
  })
}
