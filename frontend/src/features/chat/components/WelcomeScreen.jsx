import agrigeniusLogo from '../../../assets/images/agrigenius-logo.png'
import { CameraIcon, MicIcon, NavIcon } from '../../../components/common/Icons.jsx'

export default function WelcomeScreen({ strings, onPromptSelect, className = '' }) {
  const featureCards = [
    {
      id: 'crops',
      icon: <NavIcon id="crops" />,
      title: strings.welcomeCropTitle,
      description: strings.welcomeCropDescription,
      prompt: strings.welcomeCropPrompt,
    },
    {
      id: 'disease',
      icon: <CameraIcon />,
      title: strings.welcomeDiseaseTitle,
      description: strings.welcomeDiseaseDescription,
      prompt: strings.welcomeDiseasePrompt,
    },
    {
      id: 'weather',
      icon: <NavIcon id="weather" />,
      title: strings.welcomeWeatherTitle,
      description: strings.welcomeWeatherDescription,
      prompt: strings.welcomeWeatherPrompt,
    },
    {
      id: 'voice',
      icon: <MicIcon />,
      title: strings.welcomeVoiceTitle,
      description: strings.welcomeVoiceDescription,
      prompt: strings.welcomeVoicePrompt,
    },
  ]

  return (
    <div className={`welcome-scroll ${className}`}>
      <section className="welcome-screen" aria-label={strings.welcomeTitle}>
        <div className="welcome-illustration" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="welcome-hero">
          <img className="welcome-logo" src={agrigeniusLogo} alt="" draggable="false" />
          <h1>{strings.brandName}</h1>
          <p className="welcome-subtitle">{strings.welcomeSubtitle}</p>
          <p className="welcome-description">{strings.welcomeDescription}</p>
        </div>

        <div className="welcome-feature-grid">
          {featureCards.map((card) => (
            <button
              key={card.id}
              type="button"
              className="welcome-feature-card"
              onClick={() => onPromptSelect(card.prompt)}
            >
              <span className="welcome-feature-icon" aria-hidden="true">
                {card.icon}
              </span>
              <span className="welcome-feature-copy">
                <span>{card.title}</span>
                <small>{card.description}</small>
              </span>
            </button>
          ))}
        </div>

        <div className="welcome-suggestions">
          <p>{strings.tryAsking}</p>
          <div className="welcome-chip-row">
            {strings.welcomeSuggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => onPromptSelect(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
