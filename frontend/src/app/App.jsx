import { useCallback, useRef, useState } from 'react'
import LanguageToggle from '../components/ui/LanguageToggle.jsx'
import { STRINGS } from '../config/i18n.js'
import ChatPanel from '../features/chat/components/ChatPanel.jsx'
import { useChatWorkspace } from '../features/chat/hooks/useChatWorkspace.js'
import Sidebar from '../features/sidebar/components/Sidebar.jsx'
import { useDocumentPreferences } from './useDocumentPreferences.js'
import '../styles/app.css'

export default function App() {
  const [languageMode, setLanguageMode] = useState('auto')
  const [activeLanguage, setActiveLanguage] = useState('en')
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [showMobileIntro, setShowMobileIntro] = useState(false)
  const cameraTriggerRef = useRef(null)

  const strings = STRINGS[activeLanguage] || STRINGS.en
  useDocumentPreferences({
    dir: strings.dir,
    language: activeLanguage,
    largeText,
    highContrast,
  })

  const {
    activeConversationId,
    conversations,
    messages,
    isLoading,
    error,
    createNewChat,
    selectConversation,
    renameConversation,
    deleteConversation,
    sendMessage,
  } = useChatWorkspace({
    activeLanguage,
    languageMode,
    setActiveLanguage,
    strings,
  })

  const cropActions = strings.quickActions.filter((action) => action.group === 'crop')
  const informationActions = strings.quickActions.filter((action) => action.group === 'info')

  const handleManualLanguageChange = (language) => {
    setLanguageMode(language)
    setActiveLanguage(language)
  }

  const handleNewChat = useCallback(() => {
    createNewChat()
    setShowMobileIntro(false)
  }, [createNewChat])

  const handleSelectConversation = useCallback(
    (conversationId) => {
      selectConversation(conversationId)
      setShowMobileIntro(false)
    },
    [selectConversation]
  )

  const handleQuickAction = useCallback(
    (action) => {
      if (action.openCamera) {
        cameraTriggerRef.current?.()
        return
      }
      sendMessage(action.prompt)
    },
    [sendMessage]
  )

  const handleSidebarAction = useCallback(
    (action) => {
      handleQuickAction(action)
      setShowMobileIntro(false)
    },
    [handleQuickAction]
  )

  const handleWeatherAdvice = useCallback(
    (weather) => {
      const base = strings.quickActions.find((action) => action.id === 'weather')?.prompt || ''
      const extra = weather
        ? ` Current conditions: ${Math.round(weather.temperature)}°C, ${weather.humidity}% humidity, ${weather.rain_probability}% rain chance, wind ${Math.round(weather.wind_speed)} km/h.`
        : ''
      sendMessage(base + extra)
    },
    [sendMessage, strings.quickActions]
  )

  return (
    <div className={`app ${showMobileIntro ? 'mobile-intro-open' : ''}`} dir={strings.dir}>
      <button
        type="button"
        className="mobile-drawer-backdrop"
        onClick={() => setShowMobileIntro(false)}
        aria-label="Close menu"
      />
      <Sidebar
        strings={strings}
        cropActions={cropActions}
        informationActions={informationActions}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onCropAction={handleSidebarAction}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
        disabled={isLoading}
        languageToggle={
          <LanguageToggle
            language={languageMode === 'auto' ? activeLanguage : languageMode}
            onChange={handleManualLanguageChange}
          />
        }
        className={showMobileIntro ? 'visible-mobile' : ''}
        onCloseMobile={() => setShowMobileIntro(false)}
      />
      <ChatPanel
        strings={strings}
        language={activeLanguage}
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSend={sendMessage}
        onWeatherAdvice={handleWeatherAdvice}
        onOpenMobileIntro={() => setShowMobileIntro(true)}
        largeText={largeText}
        highContrast={highContrast}
        onToggleLargeText={() => setLargeText((value) => !value)}
        onToggleHighContrast={() => setHighContrast((value) => !value)}
        cameraTriggerRef={cameraTriggerRef}
      />
    </div>
  )
}
