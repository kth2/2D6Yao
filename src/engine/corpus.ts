import type { ChartTag } from './chartTags'

/** 《六爻800例》抽出的断法条文，见 SCHEMA.md `corpus/rules.jsonl`。 */
export interface CorpusRule {
  id: string
  chapter: string
  chapter_name: string
  section: string
  topic: string
  index: number
  text: string
  tags: string[]
  example_cases: number[]
}

export interface RuleMatch {
  rule: CorpusRule
  sharedTags: string[]
  score: number
}

let cache: CorpusRule[] | null = null

/** 条文库约 130KB，按需载入，不进主包。 */
export async function loadRules(): Promise<CorpusRule[]> {
  if (!cache) {
    const { default: raw } = await import('../../data/rules.jsonl?raw')
    cache = raw
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line) as CorpusRule)
  }
  return cache
}

export function listChapters(rules: readonly CorpusRule[]): string[] {
  return [...new Set(rules.map((rule) => rule.chapter_name))]
}

/**
 * 按标签重合度排条文，同章优先。
 * 用逆频率加权：「旺相」「衰弱」这类几乎条条都挂的标签权重低，
 * 「反吟」「三合局」这类少见标签权重高，避免匹配结果被通用条文淹没。
 */
export function matchRules(
  rules: readonly CorpusRule[],
  tags: readonly ChartTag[],
  chapterName?: string,
): RuleMatch[] {
  const tagIds = new Set(tags.map((tag) => tag.id))
  const counts = new Map<string, number>()
  for (const rule of rules) {
    for (const tag of rule.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }

  const weightOf = (tag: string) => Math.log(rules.length / (1 + (counts.get(tag) ?? 0)))

  return rules
    .filter((rule) => !chapterName || rule.chapter_name === chapterName)
    .map((rule) => {
      const sharedTags = rule.tags.filter((tag) => tagIds.has(tag))
      const score = sharedTags.reduce((total, tag) => total + weightOf(tag), 0)
      return { rule, sharedTags, score }
    })
    .filter((match) => match.sharedTags.length > 0)
    .sort((a, b) => b.score - a.score || a.rule.id.localeCompare(b.rule.id))
}
