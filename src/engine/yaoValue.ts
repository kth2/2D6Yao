/** 六爻起卦的原始爻值：6=老阴(动)、7=少阳(静)、8=少阴(静)、9=老阳(动)。 */
export type YaoValue = 6 | 7 | 8 | 9

export function yaoValueFromParts(yang: boolean, moving: boolean): YaoValue {
  if (yang) return moving ? 9 : 7
  return moving ? 6 : 8
}

export function partsFromYaoValue(value: YaoValue): { yang: boolean; moving: boolean } {
  return { yang: value === 7 || value === 9, moving: value === 6 || value === 9 }
}

/** 换掉若干爻的阴阳，保留原有动爻标记；offset 为起始爻位下标（下卦 0，上卦 3）。 */
export function applyLines(
  yaos: readonly YaoValue[],
  lines: readonly (0 | 1)[],
  offset = 0,
): YaoValue[] {
  const next = [...yaos]
  lines.forEach((line, index) => {
    const position = offset + index
    next[position] = yaoValueFromParts(line === 1, partsFromYaoValue(yaos[position]).moving)
  })
  return next
}

/** 动爻变出的阴阳排列：老阳变阴、老阴变阳，静爻不动。 */
export function toChangedLines(yaos: readonly YaoValue[]): (0 | 1)[] {
  return yaos.map((value) => {
    const { yang, moving } = partsFromYaoValue(value)
    const changed = moving ? !yang : yang
    return changed ? 1 : 0
  })
}

/** 本卦的阴阳排列。 */
export function toLines(yaos: readonly YaoValue[]): (0 | 1)[] {
  return yaos.map((value) => (partsFromYaoValue(value).yang ? 1 : 0))
}
