export default function InsightsList({ title, items }) {
  return (
    <section className="dashboard__section">
      <h2 className="dashboard__section-title">{title}</h2>
      <ul className="dashboard__insights">
        {items.map((item, index) => (
          <li className="dashboard__insights-item" key={index}>
            <span className="dashboard__insights-dot" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
