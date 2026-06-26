import { useEffect } from 'react'

export function useDocumentPreferences({ dir, language, largeText, highContrast }) {
  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = language
  }, [dir, language])

  useEffect(() => {
    document.documentElement.classList.toggle('large-text', largeText)
    document.documentElement.classList.toggle('high-contrast', highContrast)
  }, [largeText, highContrast])
}
