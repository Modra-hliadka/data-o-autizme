import { LINKS } from '../links.js'

export default function ParentGuide() {
  return (
    <section className="dashboard__section dashboard__parent">
      <span className="dashboard__parent-icon">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8.5 8.5a3.5 3.5 0 1 1 5.2 3c-1 .6-1.7 1.3-1.7 2.5M12 18.5h.01" />
        </svg>
      </span>
      <div className="dashboard__parent-body">
        <h2 className="dashboard__parent-title">Ste rodič a niečo vás znepokojuje?</h2>
        <p className="dashboard__parent-text">
          Sprievodca pre rodiča, ktorý má pochybnosti a okolie ho nechápe.
        </p>
        <a className="dashboard__button" href={LINKS.parentGuide} target="_blank" rel="noopener noreferrer">
          Prečítať sprievodcu →
        </a>
      </div>
    </section>
  )
}
