export default function LanguageToggle({ language, onChange }) {
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      <span className="lang-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.8 12h16.4M12 3.5c2.2 2.4 3.3 5.2 3.3 8.5s-1.1 6.1-3.3 8.5M12 3.5C9.8 5.9 8.7 8.7 8.7 12s1.1 6.1 3.3 8.5" />
        </svg>
      </span>
      <button
        type="button"
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => onChange('en')}
      >
        English
      </button>
      <span className="lang-separator" aria-hidden="true">
        |
      </span>
      <button
        type="button"
        className={`lang-btn ${language === 'ar' ? 'active' : ''}`}
        onClick={() => onChange('ar')}
      >
        العربية
      </button>
    </div>
  )
}
