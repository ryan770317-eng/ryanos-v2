/**
 * Fish Audio supports long text natively — no chunking needed.
 * We keep a simple text clean function to normalize whitespace.
 */
export function cleanScriptForTTS(text: string): string {
  return text
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[^\w\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\-]/g, '_')
    .slice(0, 100)
}
