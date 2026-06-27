import { useEffect, useState } from 'react'
import WeatherBar from '../../weather/components/WeatherBar.jsx'
import ChatHeader from './ChatHeader.jsx'
import ChatInputBar from './ChatInputBar.jsx'
import ChatMessages from './ChatMessages.jsx'
import WelcomeScreen from './WelcomeScreen.jsx'

export default function ChatPanel({
  strings,
  language,
  messages,
  isLoading,
  error,
  onSend,
  onWeatherAdvice,
  location,
  locationStatus,
  locationErrorCode,
  onRefreshLocation,
  onOpenMobileIntro,
  onToggleLargeText,
  onToggleHighContrast,
  largeText,
  highContrast,
  cameraTriggerRef,
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [droppedFileEvent, setDroppedFileEvent] = useState(null)
  const [draftPromptEvent, setDraftPromptEvent] = useState(null)
  const hasUserMessages = messages.some((message) => message.role === 'user')
  const showWelcomeScreen = !hasUserMessages && !isLoading && !error
  const [displayWelcomeScreen, setDisplayWelcomeScreen] = useState(showWelcomeScreen)

  useEffect(() => {
    if (showWelcomeScreen) {
      setDisplayWelcomeScreen(true)
      return undefined
    }

    if (!displayWelcomeScreen) return undefined
    const timeoutId = window.setTimeout(() => setDisplayWelcomeScreen(false), 220)
    return () => window.clearTimeout(timeoutId)
  }, [displayWelcomeScreen, showWelcomeScreen])

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      setDroppedFileEvent({ file, id: `${file.name}-${file.size}-${Date.now()}` })
    }
  }

  return (
    <main
      className={`chat-panel ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <ChatHeader
        strings={strings}
        isLoading={isLoading}
        largeText={largeText}
        highContrast={highContrast}
        onOpenMobileIntro={onOpenMobileIntro}
        onToggleLargeText={onToggleLargeText}
        onToggleHighContrast={onToggleHighContrast}
      />

      <WeatherBar
        strings={strings}
        location={location}
        locationStatus={locationStatus}
        locationErrorCode={locationErrorCode}
        onRefreshLocation={onRefreshLocation}
        onFarmingAdvice={onWeatherAdvice}
      />

      {displayWelcomeScreen ? (
        <WelcomeScreen
          strings={strings}
          className={!showWelcomeScreen ? 'is-leaving' : ''}
          onPromptSelect={(prompt) =>
            setDraftPromptEvent({ prompt, id: `${Date.now()}-${prompt.length}` })
          }
        />
      ) : (
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          error={error}
          language={language}
          strings={strings}
        />
      )}

      {isDragOver && (
        <div className="drop-overlay">
          <div className="drop-overlay-text">{strings.dropToAttach}</div>
        </div>
      )}

      <ChatInputBar
        strings={strings}
        language={language}
        isLoading={isLoading}
        onSend={onSend}
        cameraTriggerRef={cameraTriggerRef}
        droppedFileEvent={droppedFileEvent}
        draftPromptEvent={draftPromptEvent}
        showWelcomeHelper={showWelcomeScreen}
      />
    </main>
  )
}
