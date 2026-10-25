import { readingKind, type ReadingRecord } from './review'
import type { Verdict } from './verdict'

/**
 * 回测：用当前的规则与模型，把记了实际吉凶的是非题重新断一遍，自动评分。
 *
 * 为什么要有它：上一轮改了规则之后，旧的 50 卦一卦都没有重断 —— 手机上逐卦
 * 「载入 → 断卦 → 保存 → 重评」太费事。结果 44% 的应验率里九成是旧断语，
 * 说明不了改动有没有用。回测一键跑完，且永远和「一律判吉」这条底线放在一起比。
 */

export interface BenchmarkResult {
  readingId: number
  verdict: Verdict | null
  actual: 'good' | 'bad'
  answer: string
  error?: string
}

export interface BenchmarkRun {
  id?: number
  startedAt: number
  finishedAt?: number
  model: string
  provider: string
  appVersion: string
  caseIds: number[]
  results: BenchmarkResult[]
  /**
   * 最后一次活动的时间与中断原因。上一轮回测「0 道完成、0 道出错」，却没留下任何线索 ——
   * 页面被切到后台杀掉、请求卡住、书例库没载入，三种都可能。现在每一步都落盘。
   */
  lastActivityAt?: number
  lastError?: string
  /** 本轮的特殊情况，比如书例库没载入、只能不带书例跑。 */
  notes?: string[]
}

export type FailureKind = 'rate' | 'quota' | 'auth' | 'timeout' | 'network' | 'other'

export interface Failure {
  kind: FailureKind
  message: string
  retryAfterMs?: number
}

/**
 * 把一次失败归类，决定是等一会儿重试、跳过这道，还是整轮暂停：
 * 每分钟限额（429）等一分钟再试；当天额度用完、密钥不对就停；
 * 网络中断（多半是手机切了后台）与超时稍等重试。
 */
export function classifyFailure(cause: unknown): Failure {
  const error = cause as { status?: number; name?: string; message?: string; retryAfterMs?: number }
  const message = error?.message ?? String(cause)
  const status = typeof error?.status === 'number' ? error.status : undefined
  if (status === 401 || status === 403) return { kind: 'auth', message }
  if (status === 429 || /rate.?limit|too many requests/i.test(message)) {
    if (/per.?day|daily|exceeded your current quota|insufficient_quota|billing/i.test(message)) {
      return { kind: 'quota', message }
    }
    return { kind: 'rate', message, retryAfterMs: error?.retryAfterMs }
  }
  if (/quota|insufficient/i.test(message)) return { kind: 'quota', message }
  if (error?.name === 'TimeoutError' || /time(d)?\s?out/i.test(message)) return { kind: 'timeout', message }
  if (error?.name === 'TypeError' || /failed to fetch|load failed|network|connection/i.test(message)) {
    return { kind: 'network', message }
  }
  return { kind: 'other', message }
}

/** 能回测的卦：是非题、记了实际吉凶。 */
export function benchmarkCases<T extends ReadingRecord>(records: readonly T[]): T[] {
  return records
    .filter((record) => record.id !== undefined && record.outcome?.actual && readingKind(record) === 'binary')
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
}

/** 是非题里还没记实际吉凶的（有手动评定或经过记录的优先，最容易补）。 */
export function unlabelledCases<T extends ReadingRecord>(records: readonly T[]): T[] {
  return records
    .filter((record) => readingKind(record) === 'binary' && record.outcome && !record.outcome.actual)
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
}

/** Wilson 95% 区间：样本几十卦时，几个百分点的差别都在误差之内，必须把区间摆出来。 */
export function wilsonInterval(successes: number, total: number): [number, number] {
  if (total <= 0) return [0, 1]
  const z = 1.96
  const p = successes / total
  const denominator = 1 + (z * z) / total
  const centre = p + (z * z) / (2 * total)
  const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total)
  return [Math.max(0, (centre - margin) / denominator), Math.min(1, (centre + margin) / denominator)]
}

export function summarizeRun(run: BenchmarkRun) {
  const done = run.results.filter((result) => !result.error)
  const decided = done.filter((result) => result.verdict === 'good' || result.verdict === 'bad')
  const correct = decided.filter((result) => result.verdict === result.actual).length
  const actualGood = decided.filter((result) => result.actual === 'good').length
  const saidGood = decided.filter((result) => result.verdict === 'good')
  const saidBad = decided.filter((result) => result.verdict === 'bad')
  return {
    total: run.caseIds.length,
    done: done.length,
    errors: run.results.length - done.length,
    decided: decided.length,
    correct,
    accuracy: decided.length > 0 ? correct / decided.length : null,
    interval: wilsonInterval(correct, decided.length),
    /** 结论写「难断」的。 */
    unclear: done.filter((result) => result.verdict === 'unclear').length,
    /** 没按要求写机读结论的。 */
    missing: done.filter((result) => result.verdict === null).length,
    /** 同一批题上「一律判吉」能对多少：任何方法都得先过这条线。 */
    alwaysGood: decided.length > 0 ? actualGood / decided.length : null,
    saidGood: { total: saidGood.length, correct: saidGood.filter((r) => r.actual === 'good').length },
    saidBad: { total: saidBad.length, correct: saidBad.filter((r) => r.actual === 'bad').length },
  }
}

export type RunSummary = ReturnType<typeof summarizeRun>
