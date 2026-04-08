/**
 * Parse a raw script string into individual segment strings.
 * Supports:
 *   1. Numbered lines: "1. text", "1) text", "1、text"
 *   2. Blank-line separated paragraphs
 */
export function parseSegments(script: string): string[] {
  if (!script.trim()) return []

  const lines = script.split('\n')
  const numberedPattern = /^\s*\d+[.)、]\s*/

  const nonEmpty = lines.filter((l) => l.trim())
  const numbered = nonEmpty.filter((l) => numberedPattern.test(l))

  if (numbered.length > 0 && numbered.length >= nonEmpty.length * 0.5) {
    return numbered
      .map((l) => l.replace(numberedPattern, '').trim())
      .filter(Boolean)
  }

  return script
    .split(/\n\s*\n/)
    .map((s) => s.replace(/\n/g, ' ').trim())
    .filter(Boolean)
}
