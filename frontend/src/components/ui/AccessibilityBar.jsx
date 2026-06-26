export default function AccessibilityBar({ strings, largeText, highContrast, onToggleLargeText, onToggleHighContrast }) {
  return (
    <div className="a11y-bar" role="toolbar" aria-label={strings.a11yLabel}>
      <button
        type="button"
        className={`a11y-btn ${highContrast ? 'active' : ''}`}
        onClick={onToggleHighContrast}
        aria-pressed={highContrast}
        title={strings.themeToggle}
      >
        <span aria-hidden="true">◐</span>
        <span className="control-label">{strings.themeToggle}</span>
      </button>
      <button
        type="button"
        className={`a11y-btn ${largeText ? 'active' : ''}`}
        onClick={onToggleLargeText}
        aria-pressed={largeText}
        title={strings.accessibilityButton}
      >
        <span aria-hidden="true">A+</span>
        <span className="control-label">{strings.accessibilityButton}</span>
      </button>
    </div>
  )
}
