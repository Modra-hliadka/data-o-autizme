import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import diagnosisBreakdown from '../../data/diagnosisBreakdown.json'
import InsightsList from './InsightsList.jsx'
import { formatPercent1 } from '../format.js'

const { years, diagnoses } = diagnosisBreakdown

// Validated 8-hue categorical palette (dataviz skill, palette.md), fixed order —
// diagnoses are already sorted by 2025 prevalence share, so the order stays stable.
const SERIES_COLORS = ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834']

const chartData = years.map((year, yearIndex) => {
  const row = { year }
  diagnoses.forEach((diagnosis) => {
    row[diagnosis.id] = diagnosis.percentByYear[yearIndex]
  })
  return row
})

const firstYearIndex = 0
const lastYearIndex = years.length - 1

const changeRows = diagnoses.map((diagnosis) => ({
  ...diagnosis,
  first: diagnosis.percentByYear[firstYearIndex],
  last: diagnosis.percentByYear[lastYearIndex],
  delta: diagnosis.percentByYear[lastYearIndex] - diagnosis.percentByYear[firstYearIndex],
}))

const mostCommon = [...changeRows].sort((a, b) => b.last - a.last)[0]
const mostIncreased = changeRows.reduce((max, row) => (row.delta > max.delta ? row : max))
const mostDecreased = changeRows.reduce((min, row) => (row.delta < min.delta ? row : min))
const averageDiagnosesPerPerson = chartData[lastYearIndex]
  ? diagnoses.reduce((sum, d) => sum + d.percentByYear[lastYearIndex], 0) / 100
  : null

const insights = [
  <>
    <strong>
      {mostCommon.code} {mostCommon.label}
    </strong>{' '}
    je najčastejšia diagnóza v roku {years[lastYearIndex]}: podiel {formatPercent1(mostCommon.first)} % ({years[firstYearIndex]}) →{' '}
    <strong>{formatPercent1(mostCommon.last)} %</strong> ({years[lastYearIndex]}).
  </>,
  <>
    <strong>
      {mostIncreased.code} {mostIncreased.label}
    </strong>{' '}
    rastie medzi diagnózami najvýraznejšie: {formatPercent1(mostIncreased.first)} % → {formatPercent1(mostIncreased.last)} %
    (+{formatPercent1(mostIncreased.delta)} p.b.).
  </>,
  <>
    <strong>
      {mostDecreased.code} {mostDecreased.label}
    </strong>{' '}
    naopak ustupuje najviac: {formatPercent1(mostDecreased.first)} % → {formatPercent1(mostDecreased.last)} % (
    {formatPercent1(mostDecreased.delta)} p.b.).
  </>,
  <>
    Priemerný poistenec má vykázanú <strong>viac než jednu diagnózu</strong> — súčet podielov naprieč rokmi dosahuje cca{' '}
    {averageDiagnosesPerPerson !== null ? formatPercent1(averageDiagnosesPerPerson) : '—'} diagnózy na osobu.
  </>,
]

// Recharts' default tooltip is shared across all series at the hovered year (8 rows
// at once here), which is unreadable. We want the old Chart.js-style behaviour instead:
// show only the single point the cursor is actually over. Each Line's dot reports its
// own id on hover, and the tooltip content looks up just that one entry from `payload`.
function DiagnosisTooltip({ active, payload, label, hoveredId }) {
  if (!active || !payload || !payload.length || !hoveredId) return null
  const entry = payload.find((item) => item.dataKey === hoveredId)
  if (!entry) return null
  const diagnosis = diagnoses.find((d) => d.id === hoveredId)

  return (
    <div className="dashboard__chart-tooltip">
      <div className="dashboard__chart-tooltip-title">{label}</div>
      <div className="dashboard__chart-tooltip-row">
        <span className="dashboard__chart-tooltip-dot" style={{ background: entry.color }} />
        <span className="dashboard__chart-tooltip-label">
          {diagnosis.code} {diagnosis.label}
        </span>
        <span className="dashboard__chart-tooltip-value">{formatPercent1(entry.value)} %</span>
      </div>
    </div>
  )
}

export default function DiagnosesTab() {
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <>
      <section className="dashboard__section">
        <h2 className="dashboard__section-title">Percentuálny podiel jednotlivých diagnóz F84.x na počte poistencov</h2>
        <p className="dashboard__note dashboard__note--lead">
          Poistenec môže mať vykázaných viac diagnóz naraz, súčet riadku preto presahuje 100 %.
        </p>
        <div className="dashboard__chart">
          <ResponsiveContainer width="100%" height={440}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => `${value} %`} />
              <Tooltip content={<DiagnosisTooltip hoveredId={hoveredId} />} />
              <Legend />
              {diagnoses.map((diagnosis, index) => (
                <Line
                  key={diagnosis.id}
                  type="monotone"
                  dataKey={diagnosis.id}
                  name={`${diagnosis.code} ${diagnosis.label}`}
                  stroke={SERIES_COLORS[index]}
                  strokeWidth={2}
                  dot={{ r: 4, onMouseEnter: () => setHoveredId(diagnosis.id), onMouseLeave: () => setHoveredId(null) }}
                  activeDot={{ r: 5, onMouseEnter: () => setHoveredId(diagnosis.id), onMouseLeave: () => setHoveredId(null) }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="dashboard__section">
        <h2 className="dashboard__section-title">
          Zmena podielu {years[firstYearIndex]} → {years[lastYearIndex]}
        </h2>
        <div className="dashboard__table-wrap">
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Diagnóza</th>
                <th>Podiel {years[firstYearIndex]}</th>
                <th>Podiel {years[lastYearIndex]}</th>
                <th>Zmena</th>
              </tr>
            </thead>
            <tbody>
              {changeRows.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <span className="dashboard__table-dot" style={{ background: SERIES_COLORS[index] }} />
                    {row.code} {row.label}
                  </td>
                  <td>{formatPercent1(row.first)} %</td>
                  <td>{formatPercent1(row.last)} %</td>
                  <td className={row.delta >= 0 ? 'dashboard__delta--up' : 'dashboard__delta--down'}>
                    {row.delta >= 0 ? '▲' : '▼'} {row.delta >= 0 ? '+' : ''}
                    {formatPercent1(row.delta)} p.b.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <InsightsList title="Kľúčové zistenia — diagnózy" items={insights} />
    </>
  )
}
