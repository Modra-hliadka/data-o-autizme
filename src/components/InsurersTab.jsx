import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import insuranceHistory from '../../data/insuranceHistory.json'
import SegmentedControl from './SegmentedControl.jsx'
import { formatCount, formatPercent1 } from '../format.js'

const { years, insurers } = insuranceHistory

const VIEW_OPTIONS = [
  { value: 'count', label: 'Počty' },
  { value: 'growth', label: 'Medziročný rast (%)' },
]

function growthSeries(values) {
  return values.map((value, index) => (index === 0 ? null : ((value - values[index - 1]) / values[index - 1]) * 100))
}

export default function InsurersTab() {
  const [view, setView] = useState('count')

  const totals = years.map((_, yearIndex) => insurers.reduce((sum, insurer) => sum + insurer.values[yearIndex], 0))

  const chartData = years.map((year, yearIndex) => {
    const row = { year }
    insurers.forEach((insurer) => {
      row[insurer.id] = view === 'count' ? insurer.values[yearIndex] : growthSeries(insurer.values)[yearIndex]
    })
    if (view === 'count') row.spolu = totals[yearIndex]
    return row
  })

  const valueFormatter = (value) =>
    value === null || value === undefined ? '—' : view === 'count' ? formatCount(value) : `${formatPercent1(value)} %`

  return (
    <>
      <section className="dashboard__section">
        <h2 className="dashboard__section-title">Počet poistencov s F84.x podľa poisťovne</h2>
        <p className="dashboard__note dashboard__note--lead">
          Prepínač nižšie mení zobrazenie z absolútnych počtov na medziročný rast v %.
        </p>
        <SegmentedControl options={VIEW_OPTIONS} value={view} onChange={setView} />
        <div className="dashboard__chart">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => (view === 'count' ? formatCount(value) : `${value} %`)} />
              <Tooltip formatter={valueFormatter} />
              <Legend />
              {insurers.map((insurer) => (
                <Line
                  key={insurer.id}
                  type="monotone"
                  dataKey={insurer.id}
                  name={insurer.name}
                  stroke={insurer.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ))}
              {view === 'count' && (
                <Line
                  type="monotone"
                  dataKey="spolu"
                  name="Spolu"
                  stroke="#9aa1b3"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="dashboard__section">
        <h2 className="dashboard__section-title">Tabuľka podľa rokov</h2>
        <div className="dashboard__table-wrap">
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Rok</th>
                {insurers.map((insurer) => (
                  <th key={insurer.id}>{insurer.name}</th>
                ))}
                <th>Spolu</th>
                <th>Medziročne</th>
              </tr>
            </thead>
            <tbody>
              {years.map((year, yearIndex) => {
                const yoy = yearIndex === 0 ? null : ((totals[yearIndex] - totals[yearIndex - 1]) / totals[yearIndex - 1]) * 100
                return (
                  <tr key={year}>
                    <td>{year}</td>
                    {insurers.map((insurer) => (
                      <td key={insurer.id}>{formatCount(insurer.values[yearIndex])}</td>
                    ))}
                    <td>{formatCount(totals[yearIndex])}</td>
                    <td>{yoy === null ? '—' : `${yoy >= 0 ? '+' : ''}${formatPercent1(yoy)} %`}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
