import { useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ageBreakdown from '../../data/ageBreakdown.json'
import SegmentedControl from './SegmentedControl.jsx'
import InsightsList from './InsightsList.jsx'
import { formatCount, formatPercent1 } from '../format.js'

// 10 raw age buckets are too many distinct colors for one stacked chart to carry
// (dataviz guidance caps categorical/ordinal color at ~5-7) — the 40+ brackets are
// each a small share anyway, so they fold into a single "40+" band here. Full
// per-decade granularity stays available via the age filter on the main trend chart.
const MERGED_GROUPS = [
  { label: '0-9', color: '#86b6ef', sourceIndices: [0] },
  { label: '10-19', color: '#5598e7', sourceIndices: [1] },
  { label: '20-29', color: '#2a78d6', sourceIndices: [2] },
  { label: '30-39', color: '#1c5cab', sourceIndices: [3] },
  { label: '40+', color: '#0d366b', sourceIndices: [4, 5, 6, 7, 8, 9] },
]

const INSURER_IDS = Object.keys(ageBreakdown.insurers)
const INSURER_OPTIONS = [
  { value: 'all', label: 'Všetky' },
  { value: 'vszp', label: 'VšZP' },
  { value: 'dovera', label: 'Dôvera' },
  { value: 'union', label: 'Union' },
]
const VIEW_OPTIONS = [
  { value: 'percent', label: 'Percentuálny podiel' },
  { value: 'count', label: 'Absolútne počty' },
]

// Recharts derives the default legend/tooltip swatch and text color from each Area's
// `stroke` (used here for the 2px surface-gap separator between stacked bands), so
// both the legend and the tooltip need their own explicit color instead of the default.
const LEGEND_PAYLOAD = MERGED_GROUPS.map((group) => ({
  value: group.label,
  type: 'square',
  color: group.color,
  id: group.label,
}))

function bucketTotalsForYear(yearKey, insurerFilter) {
  const ids = insurerFilter === 'all' ? INSURER_IDS : [insurerFilter]
  return ageBreakdown.ageGroups.map((_, groupIndex) =>
    ids.reduce((sum, insurerId) => sum + ageBreakdown.insurers[insurerId][yearKey][groupIndex], 0),
  )
}

function buildChartData(insurerFilter) {
  return ageBreakdown.years.map((year) => {
    const yearKey = String(year)
    const bucketTotals = bucketTotalsForYear(yearKey, insurerFilter)
    const yearTotal = bucketTotals.reduce((sum, value) => sum + value, 0)

    const row = { year }
    MERGED_GROUPS.forEach((group) => {
      const groupTotal = group.sourceIndices.reduce((sum, index) => sum + bucketTotals[index], 0)
      row[`${group.label}__count`] = groupTotal
      row[`${group.label}__percent`] = yearTotal > 0 ? (groupTotal / yearTotal) * 100 : 0
    })
    return row
  })
}

function AgeStructureTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const dataRow = payload[0].payload

  return (
    <div className="dashboard__chart-tooltip">
      <div className="dashboard__chart-tooltip-title">{label}</div>
      {[...MERGED_GROUPS].reverse().map((group) => (
        <div className="dashboard__chart-tooltip-row" key={group.label}>
          <span className="dashboard__chart-tooltip-dot" style={{ background: group.color }} />
          <span className="dashboard__chart-tooltip-label">{group.label}</span>
          <span className="dashboard__chart-tooltip-value">
            {formatPercent1(dataRow[`${group.label}__percent`])} % · {formatCount(dataRow[`${group.label}__count`])}
          </span>
        </div>
      ))}
    </div>
  )
}

// Insights always describe the full (all-insurer) picture, independent of the filter above.
function buildInsights() {
  const all = buildChartData('all')
  const first = all[0]
  const last = all[all.length - 1]
  const firstYear = ageBreakdown.years[0]
  const lastYear = ageBreakdown.years[ageBreakdown.years.length - 1]

  const under30First = first['0-9__percent'] + first['10-19__percent'] + first['20-29__percent']
  const under30Last = last['0-9__percent'] + last['10-19__percent'] + last['20-29__percent']
  const under20First = first['0-9__percent'] + first['10-19__percent']
  const under20Last = last['0-9__percent'] + last['10-19__percent']
  const under20CountFirst = first['0-9__count'] + first['10-19__count']
  const under20CountLast = last['0-9__count'] + last['10-19__count']

  return [
    <>
      V roku {lastYear} malo <strong>{formatPercent1(under30Last)} %</strong> poistencov s F84.x menej ako 30 rokov (
      {firstYear}: {formatPercent1(under30First)} %).
    </>,
    <>
      Ťažisko sa posúva z najmladších detí (0-9) do školského veku (10-19): podiel 0-9 rokov klesol z{' '}
      <strong>{formatPercent1(first['0-9__percent'])} %</strong> na {formatPercent1(last['0-9__percent'])} %, zatiaľ čo
      10-19 rokov vzrástol z {formatPercent1(first['10-19__percent'])} % na{' '}
      <strong>{formatPercent1(last['10-19__percent'])} %</strong>.
    </>,
    <>
      Podiel detí do 20 rokov klesol z {formatPercent1(under20First)} % ({firstYear}) na{' '}
      <strong>{formatPercent1(under20Last)} % ({lastYear})</strong> — v absolútnych číslach ich ale naďalej pribúda (z{' '}
      {formatCount(under20CountFirst)} na {formatCount(under20CountLast)} osôb).
    </>,
    <>
      Dospelí nad 40 rokov tvoria trvalo len malý zlomok — <strong>iba {formatPercent1(last['40+__percent'])} %</strong> v
      roku {lastYear}.
    </>,
  ]
}

const INSIGHTS = buildInsights()

export default function AgeStructureChart() {
  const [insurerFilter, setInsurerFilter] = useState('all')
  const [view, setView] = useState('percent')

  const chartData = useMemo(() => buildChartData(insurerFilter), [insurerFilter])
  const isPercent = view === 'percent'

  return (
    <>
      <section className="dashboard__section">
        <h2 className="dashboard__section-title">Vývoj vekovej štruktúry pacientov 2015 – 2025</h2>
        <div className="dashboard__controls-row">
          <label className="dashboard__control-label" htmlFor="age-insurer-select">
            Poisťovňa:
          </label>
          <select
            id="age-insurer-select"
            className="dashboard__select"
            value={insurerFilter}
            onChange={(e) => setInsurerFilter(e.target.value)}
          >
            {INSURER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <SegmentedControl options={VIEW_OPTIONS} value={view} onChange={setView} />
        </div>
        <div className="dashboard__chart">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              {isPercent ? (
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(value) => `${Math.round(value)}%`} />
              ) : (
                <YAxis tickFormatter={(value) => formatCount(value)} />
              )}
              <Tooltip content={<AgeStructureTooltip />} />
              <Legend payload={LEGEND_PAYLOAD} formatter={(value) => <span style={{ color: '#1f2430' }}>{value}</span>} />
              {MERGED_GROUPS.map((group) => (
                <Area
                  key={group.label}
                  type="monotone"
                  dataKey={`${group.label}__${isPercent ? 'percent' : 'count'}`}
                  name={group.label}
                  stackId="age"
                  stroke="#fff"
                  strokeWidth={2}
                  fill={group.color}
                  fillOpacity={1}
                  isAnimationActive={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <InsightsList title="Kľúčové zistenia — vek" items={INSIGHTS} />
    </>
  )
}
