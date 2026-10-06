import { LINKS } from '../links.js'
import ArrowCircle from './ArrowCircle.jsx'

const CARDS = [
  {
    title: 'Ako vznikli tieto dáta',
    text: 'Príbeh prvých otvorených dát o autizme na Slovensku.',
    href: LINKS.openDataArticle,
  },
  {
    title: 'Ako je to v USA',
    text: 'Komunitná správa o autizme 2023 (v angličtine).',
    href: LINKS.worldReport,
  },
]

export default function ReadMore() {
  return (
    <section className="dashboard__section dashboard__readmore">
      <h2 className="dashboard__section-title">Čítajte ďalej</h2>
      <div className="dashboard__readmore-grid">
        {CARDS.map((card) => (
          <a
            key={card.href}
            className="dashboard__readmore-card"
            href={card.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="dashboard__readmore-head">
              <span className="dashboard__readmore-title">{card.title}</span>
              <ArrowCircle />
            </span>
            <span className="dashboard__readmore-text">{card.text}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
