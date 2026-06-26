import AccessibilityBar from '../../../components/ui/AccessibilityBar.jsx'

export default function ChatHeader({
  strings,
  isLoading,
  largeText,
  highContrast,
  onOpenMobileIntro,
  onToggleLargeText,
  onToggleHighContrast,
}) {
  return (
    <header className="chat-header">
      <div className="chat-header-left">
        <button type="button" className="mobile-menu-btn" onClick={onOpenMobileIntro} aria-label={strings.mobileMenu}>
          ☰
        </button>
        <div className="chat-title-group">
          <div className="chat-header-title">{strings.brandName}</div>
          <div className="chat-header-sub">{strings.headerSubtitle}</div>
        </div>
      </div>
      <div className="chat-header-right">
        <AccessibilityBar
          strings={strings}
          largeText={largeText}
          highContrast={highContrast}
          onToggleLargeText={onToggleLargeText}
          onToggleHighContrast={onToggleHighContrast}
        />
        <div className={`status-dot ${isLoading ? 'thinking' : ''}`}>
          {isLoading ? strings.statusThinking : strings.statusReady}
        </div>
      </div>
    </header>
  )
}
