// Šípka v kruhu: značka klikateľnej karty (rovnaká ako na landing page Kompasia).

export default function ArrowCircle() {
  return (
    <svg className="dashboard__arrow-circle" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="16" cy="16" r="14.5" />
      <path d="M9.5 16h13M17.5 11l5 5-5 5" />
    </svg>
  )
}
