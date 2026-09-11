import { analyzeLiuyaoEvidence } from 'mingyu-core/divination/liuyao'
import type { LiuyaoEvidenceTopic } from 'mingyu-core/divination/liuyao'
import type { LiuyaoChart } from './liuyao'

export type ChartEvidence = ReturnType<typeof analyzeLiuyaoEvidence>

export const sixRelatives = ['父母', '兄弟', '子孙', '妻财', '官鬼'] as const
export type SixRelative = (typeof sixRelatives)[number]

/**
 * 资料库事类 → mingyu-core 取用主题。
 * 库里已有主题的（财运/感情/事业）交给它按主题默认取用；
 * 其余事类按传统用神直接指定六亲，拿不准的（出行、天气、终身）留给通用主轴（世爻）。
 */
const chapterTopics: Record<string, { topic: LiuyaoEvidenceTopic; relative?: SixRelative }> = {
  财运: { topic: 'caifu' },
  婚姻情缘: { topic: 'ganqing' },
  '官运·事业': { topic: 'shiye' },
  子女: { topic: 'general', relative: '子孙' },
  学历文事: { topic: 'general', relative: '父母' },
  '疾病·伤灾': { topic: 'general', relative: '官鬼' },
  '官司·牢狱': { topic: 'general', relative: '官鬼' },
  失物: { topic: 'general', relative: '妻财' },
}

export interface EvidenceOptions {
  /** 资料库事类，用于挑取用主题。 */
  chapter?: string
  /** 用户明确指定的用神六亲，优先于主题默认。 */
  relative?: SixRelative
}

/** 按事类（或用户指定的六亲）取用神，返回用神候选、原神忌神仇神与逐爻支持/反证。 */
export function analyzeEvidence(liuyao: LiuyaoChart, options: EvidenceOptions = {}): ChartEvidence {
  const preset = options.chapter ? chapterTopics[options.chapter] : undefined
  const relative = options.relative ?? preset?.relative
  return analyzeLiuyaoEvidence(liuyao, {
    topic: preset?.topic ?? 'general',
    ...(relative ? { usefulGodRelative: relative } : {}),
  })
}

/** 事类的默认用神六亲；主题自行取用（如感情以世应分我方对方）时为空。 */
export function defaultRelativeFor(chapter?: string): SixRelative | undefined {
  return chapter ? chapterTopics[chapter]?.relative : undefined
}
