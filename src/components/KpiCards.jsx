export default function KpiCards({ items }) {
  return (
    <div className="dashboard__kpis">
      {items.map((item) => (
        <div className="dashboard__kpi-card" key={item.label}>
          <div className="dashboard__kpi-label">{item.label}</div>
          <div className="dashboard__kpi-value">{item.value}</div>
          {item.delta && <div className="dashboard__kpi-delta">{item.delta}</div>}
        </div>
      ))}
    </div>
  )
}
