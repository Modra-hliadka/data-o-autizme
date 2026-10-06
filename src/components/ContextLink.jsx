// Kontextový blok pod grafom: piktogram, jedna veta a tlačidlá s odkazmi na súvisiaci obsah.

const ICONS = {
  bulb: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
}

export default function ContextLink({ icon = 'bulb', text, links }) {
  return (
    <div className="dashboard__context">
      <span className="dashboard__context-icon">{ICONS[icon]}</span>
      <div className="dashboard__context-body">
        <p className="dashboard__context-text">{text}</p>
        <div className="dashboard__context-actions">
          {links.map((link) => (
            <a
              key={link.href}
              className="dashboard__button"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label} →
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
