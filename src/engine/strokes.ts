export interface CharacterStroke {
  char: string
  strokes: number
}

export interface StrokeAnalysis {
  characters: CharacterStroke[]
  /** 字库里查不到的字，起卦时需排除。 */
  unknown: string[]
}

/** 康熙笔画，用于以字画起卦。字库约 5MB，按需动态载入，不进主包。 */
export async function analyzeKangxiStrokes(text: string): Promise<StrokeAnalysis> {
  const { analyzeChineseCharacters } = await import('mingyu-core/name-number')
  const result = analyzeChineseCharacters(text)
  return {
    characters: result.characters
      .filter((item) => item.detail !== null)
      .map((item) => ({ char: item.char, strokes: item.detail!.kangxiStrokes })),
    unknown: result.unknownCharacters,
  }
}
