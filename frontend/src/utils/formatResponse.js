const HIGHLIGHT_LABELS =
  /^(disease|diagnosis|treatment|prevention|symptoms|causes|confidence|warning|caution|recommendation|pesticide|fertilizer|irrigation|harvest|price|market|crop|weather|advice|expert|note|important)/i

/** Strip common Markdown artifacts from AI output. */
export function stripMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\*\*\*(.+?)\*\*\*/gs, '$1')
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/\*(.+?)\*/gs, '$1')
    .replace(/__(.+?)__/gs, '$1')
    .replace(/_(.+?)_/gs, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/^\*\*\*+$/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()
}

/**
 * Parse sanitized AI text into renderable blocks.
 * @returns {{ type: string, content: string, label?: string, number?: string, highlight?: boolean }[]}
 */
export function parseFormattedResponse(text) {
  const clean = stripMarkdown(text)
  if (!clean) return []

  const blocks = []
  const lines = clean.split('\n')

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    const labelMatch = line.match(/^([A-Za-z\u0600-\u06FF\u0900-\u097F\s]+):\s*(.+)$/)
    if (labelMatch) {
      const label = labelMatch[1].trim()
      blocks.push({
        type: 'label',
        label,
        content: labelMatch[2].trim(),
        highlight: HIGHLIGHT_LABELS.test(label),
      })
      continue
    }

    const bulletMatch = line.match(/^[\-\*•]\s+(.+)$/)
    if (bulletMatch) {
      blocks.push({ type: 'bullet', content: bulletMatch[1] })
      continue
    }

    const numberedMatch = line.match(/^(\d+)[.)]\s+(.+)$/)
    if (numberedMatch) {
      blocks.push({ type: 'numbered', number: numberedMatch[1], content: numberedMatch[2] })
      continue
    }

    const isShortHeading =
      line.length <= 48 &&
      !line.endsWith('.') &&
      !line.endsWith('!') &&
      !line.endsWith('?') &&
      !line.endsWith('۔') &&
      !/^[\d•\-]/.test(line)

    if (isShortHeading && blocks.length > 0) {
      blocks.push({ type: 'heading', content: line })
      continue
    }

    blocks.push({ type: 'paragraph', content: line })
  }

  return blocks
}
