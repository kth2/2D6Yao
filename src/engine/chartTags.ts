import { wuxing } from 'mingyu-core/wuxing'
import type { LiuyaoChart } from './liuyao'

/**
 * 把卦盘折算成资料库同一套标签（见 SCHEMA.md「标签体系」），用于匹配断法条文。
 * 只标可由卦盘直接判定的事实；需要先定用神的标签（用神两现、原神忌神、通关、从格等）
 * 留到用神选择做出来之后再补。
 */
export interface ChartTag {
  id: string
  label: string
  /** 命中依据，直接展示给用户看，避免匹配结果像黑箱。 */
  reason: string
}

const positionLabels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']
const sixRelatives = ['父母', '兄弟', '子孙', '妻财', '官鬼']

const describe = (yao: { position: number; sixRelative: string; najiaDizhi: string; wuxing: string }) =>
  `${positionLabels[yao.position - 1]}${yao.sixRelative}${yao.najiaDizhi}${yao.wuxing}`

export function extractChartTags(liuyao: LiuyaoChart): ChartTag[] {
  const tags: ChartTag[] = []
  const add = (id: string, label: string, reason: string) => tags.push({ id, label, reason })

  const yaos = liuyao.yaosDetail
  const world = yaos.find((yao) => yao.isWorld)
  const response = yaos.find((yao) => yao.isResponse)
  const moving = yaos.filter((yao) => yao.isChanging)
  const branchOf = (ganzhi: string) => ganzhi.charAt(1)

  if (world) {
    add('yongshen_chishi', '持世', `${describe(world)}持世`)
    if (world.seasonState === '旺' || world.seasonState === '相') {
      add('wangxiang', '旺相', `世爻${world.wuxing}当令${world.seasonState}`)
    }
    if (world.seasonState === '休' || world.seasonState === '囚' || world.seasonState === '死') {
      add('shuairuo', '衰弱', `世爻${world.wuxing}处${world.seasonState}地`)
    }
  }

  if (world && response) {
    const relation = wuxing.isSheng(response.wuxing, world.wuxing)
      ? '应生世'
      : wuxing.isSheng(world.wuxing, response.wuxing)
        ? '世生应'
        : wuxing.isKe(response.wuxing, world.wuxing)
          ? '应克世'
          : wuxing.isKe(world.wuxing, response.wuxing)
            ? '世克应'
            : '世应比和'
    add('shiying', '世应关系', relation)
  }

  const collect = (
    id: string,
    label: string,
    matched: typeof yaos,
    suffix: string,
  ) => {
    if (matched.length > 0) add(id, label, `${matched.map(describe).join('、')}${suffix}`)
  }

  collect('xunkong', '旬空', yaos.filter((yao) => yao.isVoid), '旬空')
  collect('yuepo', '月破', yaos.filter((yao) => yao.isMonthBreak), '月破')
  collect('ripo', '日破', yaos.filter((yao) => yao.isDayBreak), '日破')
  collect('andong', '暗动', yaos.filter((yao) => yao.isHiddenMove), '暗动')
  collect(
    'rumu',
    '入墓',
    yaos.filter((yao) => yao.isRuMu || yao.isDongMu || yao.isHuaMu || yao.isRiMu),
    '入墓',
  )
  collect(
    'huitou_sheng',
    '回头生',
    yaos.filter((yao) => yao.changeRelations?.includes('回头生')),
    '动化回头生',
  )
  collect(
    'huitou_ke',
    '回头克',
    yaos.filter((yao) => yao.changeRelations?.includes('回头克')),
    '动化回头克',
  )
  collect(
    'jinshen',
    '化进神',
    yaos.filter((yao) => yao.changeDirection === '化进神'),
    '化进神',
  )
  collect(
    'tuishen',
    '化退神',
    yaos.filter((yao) => yao.changeDirection === '化退神'),
    '化退神',
  )
  collect(
    'taisui',
    '临太岁',
    yaos.filter((yao) => yao.najiaDizhi === branchOf(liuyao.ganzhi.year)),
    `临太岁${liuyao.ganzhi.year}`,
  )
  collect(
    'yuejian',
    '临月建',
    yaos.filter((yao) => yao.najiaDizhi === branchOf(liuyao.ganzhi.month)),
    `临月建${liuyao.ganzhi.month}`,
  )
  collect(
    'richen',
    '临日辰',
    yaos.filter((yao) => yao.najiaDizhi === branchOf(liuyao.ganzhi.day)),
    `临日辰${liuyao.ganzhi.day}`,
  )

  if (moving.length === 1) {
    add('dufa', '独发', `${describe(moving[0])}独发`)
  }

  const chongLabels = [
    liuyao.hexagramRelations?.original === '六冲卦' && '本卦六冲',
    liuyao.hexagramRelations?.changed === '六冲卦' && '变卦六冲',
  ].filter(Boolean)
  if (chongLabels.length > 0) add('liuchong', '六冲', chongLabels.join('，'))

  const heLabels = [
    liuyao.hexagramRelations?.original === '六合卦' && '本卦六合',
    liuyao.hexagramRelations?.changed === '六合卦' && '变卦六合',
  ].filter(Boolean)
  if (heLabels.length > 0) add('liuhe', '六合', heLabels.join('，'))

  const fanyin = liuyao.fanfuRelations?.fanyin ?? []
  if (fanyin.length > 0) add('fanyin', '反吟', fanyin.map((item) => item.label).join('、'))
  const fuyin = liuyao.fanfuRelations?.fuyin ?? []
  if (fuyin.length > 0) add('fuyin', '伏吟', fuyin.map((item) => item.label).join('、'))

  const sanxing = liuyao.sanxingInYaos ?? []
  if (sanxing.length > 0) {
    add('sanxing', '三刑', sanxing.map((item) => `${item.branches.join('')}${item.type}`).join('、'))
  }

  const sanhe = [liuyao.sanheWithDay, liuyao.sanheWithMonth].filter((item) => item != null)
  if (sanhe.length > 0) add('sanhe_ju', '三合局', sanhe.map((item) => item.description).join('；'))

  const hidden = liuyao.hiddenSpirits ?? []
  if (hidden.length > 0) {
    add(
      'fushen',
      '伏神',
      hidden
        .map(
          (spirit) =>
            `${spirit.sixRelative}${spirit.najiaDizhi}${spirit.wuxing}伏于${positionLabels[spirit.underYao.position - 1]}下`,
        )
        .join('、'),
    )
  }

  const missing = sixRelatives.filter((name) => !yaos.some((yao) => yao.sixRelative === name))
  if (missing.length > 0) add('buashanggua', '不上卦', `${missing.join('、')}不上卦`)

  if (liuyao.palaceStage === '游魂') add('youhun', '游魂', '本卦为游魂卦')
  if (liuyao.palaceStage === '归魂') add('guihun', '归魂', '本卦为归魂卦')

  return tags
}
