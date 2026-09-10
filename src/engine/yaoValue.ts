/** 六爻起卦的原始爻值：6=老阴(动)、7=少阳(静)、8=少阴(静)、9=老阳(动)。 */
export type YaoValue = 6 | 7 | 8 | 9

export function yaoValueFromParts(yang: boolean, moving: boolean): YaoValue {
  if (yang) return moving ? 9 : 7
  return moving ? 6 : 8
}

export function partsFromYaoValue(value: YaoValue): { yang: boolean; moving: boolean } {
  return { yang: value === 7 || value === 9, moving: value === 6 || value === 9 }
}
