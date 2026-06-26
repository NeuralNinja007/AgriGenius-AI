import { useEffect, useRef } from 'react'
import { AlertIcon } from '../../../components/common/Icons.jsx'
import ChatMessage from './ChatMessage.jsx'
import TypingIndicator from './TypingIndicator.jsx'

export default function ChatMessages({ messages, isLoading, error, language, strings }) {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="messages">
      {messages.map((message, i) => (
        <ChatMessage
          key={i}
          role={message.role}
          content={message.content}
          image={message.image}
          language={language}
          strings={strings}
        />
      ))}
      {isLoading && <TypingIndicator />}
      {error && (
        <div className="msg bot">
          <div className="avatar bot">
            <AlertIcon />
          </div>
          <div className="bubble error-bubble">
            <p>{error}</p>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
