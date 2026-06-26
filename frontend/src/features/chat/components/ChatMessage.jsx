import { useState } from 'react'
import { detectLanguage } from '../../../config/i18n.js'
import { isSpeechSynthesisSupported, speakText, stopSpeaking } from '../../../utils/speech.js'
import { LeafIcon, SpeakerIcon } from '../../../components/common/Icons.jsx'
import FormattedMessage from './FormattedMessage.jsx'

export default function ChatMessage({ role, content, image, language, strings }) {
  const isUser = role === 'user'
  const dir = content ? (detectLanguage(content) === 'ar' ? 'rtl' : 'ltr') : 'ltr'
  const [isReading, setIsReading] = useState(false)

  const handleReadAloud = () => {
    if (isReading) {
      stopSpeaking()
      setIsReading(false)
      return
    }
    setIsReading(true)
    speakText(content, language)
    const check = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setIsReading(false)
        clearInterval(check)
      }
    }, 300)
  }

  return (
    <div className={`msg ${isUser ? 'user' : 'bot'}`}>
      <div className={`avatar ${isUser ? 'user' : 'bot'}`}>{isUser ? '' : <LeafIcon />}</div>
      <div className="bubble" dir={dir}>
        {image && <img className="msg-image" src={image} alt="Attached crop or pest photo" />}
        {content &&
          (isUser ? (
            content.split('\n').map((line, i) => <p key={i}>{line}</p>)
          ) : (
            <>
              <FormattedMessage content={content} dir={dir} />
              {isSpeechSynthesisSupported() && (
                <button
                  type="button"
                  className="read-aloud-btn"
                  onClick={handleReadAloud}
                  aria-label={isReading ? strings.stopReading : strings.readAloud}
                >
                  <SpeakerIcon active={isReading} /> {isReading ? strings.stopReading : strings.readAloud}
                </button>
              )}
            </>
          ))}
      </div>
    </div>
  )
}
