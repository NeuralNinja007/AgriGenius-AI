export function NavIcon({ id }) {
  const paths = {
    disease: ['M7 4h10', 'M9 4v5l-3.5 6.5A3 3 0 008.1 20h7.8a3 3 0 002.6-4.5L15 9V4', 'M8 14h8'],
    crops: ['M12 20V9', 'M12 13c-3.2 0-5.5-1.8-6-5 3.2 0 5.5 1.8 6 5Z', 'M12 11c2.9 0 4.8-1.6 5.4-4.5-2.9 0-4.8 1.6-5.4 4.5Z'],
    fertilizer: ['M9 3h6', 'M10 3v6l-4 7a3 3 0 002.6 4.5h6.8A3 3 0 0018 16l-4-7V3', 'M8 15h8'],
    pest: ['M8 9h8', 'M9 13h6', 'M12 7v10', 'M7 11l-3-2', 'M17 11l3-2', 'M7 15l-3 2', 'M17 15l3 2'],
    weather: ['M5 16.5h11a3 3 0 10-.6-5.9A5 5 0 005.5 12', 'M7 6.5V4', 'M4.8 8.2 3 6.4', 'M11 4.8 12.8 3'],
    schemes: ['M4 10h16', 'M6 10V8l6-4 6 4v2', 'M7 10v8', 'M12 10v8', 'M17 10v8', 'M5 18h14'],
    market: ['M5 19V5', 'M5 19h14', 'M8 15l3-3 3 2 4-6'],
    expert: ['M12 12a4 4 0 100-8 4 4 0 000 8Z', 'M4.5 20a7.5 7.5 0 0115 0', 'M17 9h4', 'M19 7v4'],
    chat: ['M5 6.5h14', 'M5 11.5h11', 'M5 16.5h7'],
    more: ['M12 6.8h.01', 'M12 12h.01', 'M12 17.2h.01'],
    edit: ['M4 20h4l10.5-10.5a2.1 2.1 0 00-3-3L5 17v3Z', 'M14 8l2 2'],
    trash: ['M5 7h14', 'M10 11v5', 'M14 11v5', 'M8 7l1-3h6l1 3', 'M7 7l1 13h8l1-13'],
    plus: ['M12 5v14', 'M5 12h14'],
    clock: ['M12 7v5l3 2', 'M12 21a9 9 0 100-18 9 9 0 000 18Z'],
    tip: ['M12 21V9', 'M12 9c-2.8-.4-5.2.6-7 3', 'M12 9c2.8-.4 5.2.6 7 3', 'M12 9c-1.4-2.3-3.4-3.7-6-4', 'M12 9c1.4-2.3 3.4-3.7 6-4'],
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {(paths[id] || paths.chat).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

export function LeafIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 5c-7.5.4-12 4.7-12 11 6.3 0 10.6-4.5 12-11Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 16c2.8-2.8 5.3-4.6 8.8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function AlertIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4l9 16H3L12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 9v5M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function AttachIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="10" r="1.7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 17l4.5-4.5a1.5 1.5 0 012.1 0L14 15l1.4-1.4a1.5 1.5 0 012.1 0L20 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CameraIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M4 8h2.5l1.5-2h8l1.5 2H20a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="14" r="3.3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function GalleryIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 16l4.5-4.5a1.5 1.5 0 012.1 0L14 15l2-2a1.5 1.5 0 012.1 0L20.5 15.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MicIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function SpeakerIcon({ active }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {active ? (
        <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      ) : (
        <>
          <path d="M4 10v4h4l5 4V6l-5 4H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M16 9.5a4 4 0 010 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M18.5 7a7 7 0 010 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

export function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s7-5.1 7-11a7 7 0 10-14 0c0 5.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

export function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 11L21 3L13 21L11 13L3 11Z" stroke="white" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
