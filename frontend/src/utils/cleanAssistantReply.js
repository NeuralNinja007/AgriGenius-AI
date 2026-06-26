export function cleanAssistantReply(reply) {
  if (!reply) return ''
  let text = String(reply)
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '')
  text = text.replace(/```(?:reasoning|thinking|internal)[\s\S]*?```/gi, '')

  const finalMarkers = [
    /(?:^|\n)\s*(?:final answer|final response|answer)\s*:\s*/i,
    /(?:^|\n)\s*(?:الإجابة النهائية)\s*:\s*/i,
  ]

  for (const marker of finalMarkers) {
    const match = text.match(marker)
    if (match?.index !== undefined) {
      text = text.slice(match.index + match[0].length)
      break
    }
  }

  const internalLine = /^\s*(?:we need to|the instruction says|we must|i need to|plan:|analysis:|reasoning:|developer instruction|system instruction)\b/i
  text = text
    .split('\n')
    .filter((line) => !internalLine.test(line))
    .join('\n')
    .trim()

  return text || String(reply).trim()
}
