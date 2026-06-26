const SPEECH_LANG = { en: 'en-IN', ar: 'ar-SA' }

export function getSpeechLang(language) {
  return SPEECH_LANG[language] || 'en-IN'
}

export function isSpeechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function isSpeechSynthesisSupported() {
  return !!window.speechSynthesis
}

export function createSpeechRecognition(language, onResult, onError, onEnd) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) return null

  const recognition = new SpeechRecognition()
  recognition.lang = getSpeechLang(language)
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  recognition.continuous = false

  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript || ''
    onResult(transcript)
  }
  recognition.onerror = (event) => onError?.(event.error)
  recognition.onend = () => onEnd?.()

  return recognition
}

export function speakText(text, language) {
  if (!window.speechSynthesis || !text) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = getSpeechLang(language)
  utterance.rate = 0.95
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel()
}
