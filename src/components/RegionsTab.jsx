import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import regionBreakdown from '../../data/regionBreakdown.json'
import regionPopulation from '../../data/regionPopulation.json'
import SegmentedControl from './SegmentedControl.jsx'
import InsightsList from './InsightsList.jsx'
import { formatCount, formatPercent1 } from '../format.js'

const { years, regions, insurers: regionByInsurer } = regionBreakdown
const { populationByRegion } = regionPopulation
const INSURER_IDS = Object.keys(regionByInsurer)
const INSURER_LABELS = { vszp: 'VšZP', dovera: 'Dôvera', union: 'Union' }

// Schematic grid loosely approximating each region's real position in Slovakia
// (not a geographic map) — null cells stay empty to shape the layout.
const TILE_LAYOUT = [
  null, 'Žilinský', 'Prešovský',
  'Trenčiansky', 'Banskobystrický', 'Košický',
  'Trnavský', 'Nitriansky', null,
  'Bratislavský', null, null,
]

const SEQUENTIAL_STEPS = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b']

const METRIC_OPTIONS = [
  { value: 'count', label: 'Počet' },
  { value: 'capita', label: 'Na 10 000 obyvateľov' },
]
const INSURER_OPTIONS = [
  { value: 'all', label: 'Všetky' },
  { value: 'vszp', label: 'VšZP' },
  { value: 'dovera', label: 'Dôvera' },
  { value: 'union', label: 'Union' },
]

function regionValue(region, yearIndex, insurerFilter) {
  const regionIndex = regions.indexOf(region)
  if (insurerFilter === 'all') {
    return INSURER_IDS.reduce((sum, id) => sum + regionByInsurer[id][years[yearIndex]][regionIndex], 0)
  }
  return regionByInsurer[insurerFilter][years[yearIndex]][regionIndex]
}

function regionSeries(region, insurerFilter) {
  return years.map((_, yearIndex) => regionValue(region, yearIndex, insurerFilter))
}

function colorFor(value, max) {
  if (!max) return SEQUENTIAL_STEPS[0]
  const t = value / max
  const index = Math.min(SEQUENTIAL_STEPS.length - 1, Math.floor(t * SEQUENTIAL_STEPS.length))
  return SEQUENTIAL_STEPS[index]
}

export default function RegionsTab() {
  const [insurerFilter, setInsurerFilter] = useState('all')
  const [metric, setMetric] = useState('count')
  const [year, setYear] = useState(years[years.length - 1])
  const [selectedRegion, setSelectedRegion] = useState('Košický')

  const yearIndex = years.indexOf(year)

  const rows = useMemo(
    () =>
      regions.map((region) => {
        const count = regionValue(region, yearIndex, insurerFilter)
        const population = populationByRegion[region]
        const capita = population ? (count / population) * 10000 : null
        return { region, count, capita }
      }),
    [yearIndex, insurerFilter],
  )

  const metricValue = (row) => (metric === 'capita' ? row.capita : row.count)
  const maxValue = Math.max(...rows.map((row) => metricValue(row) ?? 0))
  const rankedRows = [...rows].sort((a, b) => (metricValue(b) ?? -1) - (metricValue(a) ?? -1))

  const displayValue = (value) => (value === null || value === undefined ? '—' : metric === 'capita' ? formatPercent1(value) : formatCount(value))

  const selectedSeries = regionSeries(selectedRegion, insurerFilter)
  const selectedPopulation = populationByRegion[selectedRegion]
  const chartData = years.map((y, index) => ({
    year: y,
    value: metric === 'capita' && selectedPopulation ? (selectedSeries[index] / selectedPopulation) * 10000 : selectedSeries[index],
  }))

  const totalByYear = (yIndex) => regions.reduce((sum, region) => sum + regionValue(region, yIndex, insurerFilter), 0)
  const shareOf = (region, yIndex) => (regionValue(region, yIndex, insurerFilter) / totalByYear(yIndex)) * 100

  const lastIndex = years.length - 1
  const shareLastByRegion = regions.map((region) => ({ region, share: shareOf(region, lastIndex) }))
  const shareFirstByRegion = regions.map((region) => ({ region, share: shareOf(region, 0) }))
  const topTwoLast = [...shareLastByRegion].sort((a, b) => b.share - a.share).slice(0, 2)
  const combinedTopShare = topTwoLast.reduce((sum, r) => sum + r.share, 0)

  const deltas = regions.map((region) => {
    const first = shareFirstByRegion.find((r) => r.region === region).share
    const last = shareLastByRegion.find((r) => r.region === region).share
    return { region, first, last, delta: last - first }
  })
  const mostIncreased = deltas.reduce((max, r) => (r.delta > max.delta ? r : max))
  const mostDecreased = deltas.reduce((min, r) => (r.delta < min.delta ? r : min))

  const insights = [
    <>
      <strong>
        {topTwoLast[0].region} ({formatPercent1(topTwoLast[0].share)} %) a {topTwoLast[1].region} kraj (
        {formatPercent1(topTwoLast[1].share)} %)
      </strong>{' '}
      majú v roku {years[lastIndex]} spolu najvyšší podiel evidovaných osôb s F84.x —{' '}
      <strong>{formatPercent1(combinedTopShare)} %</strong>. Ide o údaj podľa trvalého pobytu, nie o mieru dostupnosti
      diagnostiky v danom kraji.
    </>,
    <>
      <strong>{mostIncreased.region} kraj</strong> rastie percentuálnym podielom najvýraznejšie zo všetkých krajov: z{' '}
      {formatPercent1(mostIncreased.first)} % ({years[0]}) na {formatPercent1(mostIncreased.last)} % ({years[lastIndex]}).
    </>,
    <>
      <strong>{mostDecreased.region} kraj</strong> má naopak najviac klesajúci podiel: z {formatPercent1(mostDecreased.first)} %
      ({years[0]}) na {formatPercent1(mostDecreased.last)} % ({years[lastIndex]}), hoci aj tu absolútny počet poistencov
      rástol.
    </>,
  ]

  return (
    <>
      <section className="dashboard__section">
        <p className="dashboard__note dashboard__note--lead">Kraj je určený podľa trvalého pobytu poistenca.</p>
        <div className="dashboard__controls-row">
          <label className="dashboard__control-label" htmlFor="region-insurer-select">
            Poisťovňa:
          </label>
          <select
            id="region-insurer-select"
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

          <label className="dashboard__control-label" htmlFor="region-year-select">
            Rok mapy:
          </label>
          <select id="region-year-select" className="dashboard__select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <SegmentedControl options={METRIC_OPTIONS} value={metric} onChange={setMetric} />
        </div>

        <div className="dashboard__grid-2">
          <div>
            <h3 className="dashboard__subheading">Schematická mriežka krajov (kliknite pre výber)</h3>
            <div className="dashboard__tilemap">
              {TILE_LAYOUT.map((region, index) => {
                if (!region) return <div className="dashboard__tile dashboard__tile--empty" key={index} />
                const row = rows.find((r) => r.region === region)
                const value = metricValue(row)
                const selected = region === selectedRegion
                return (
                  <button
                    type="button"
                    key={region}
                    className={selected ? 'dashboard__tile dashboard__tile--selected' : 'dashboard__tile'}
                    style={{ background: colorFor(value ?? 0, maxValue) }}
                    onClick={() => setSelectedRegion(region)}
                  >
                    {region}
                    <span className="dashboard__tile-count">{displayValue(value)}</span>
                  </button>
                )
              })}
            </div>
            <p className="dashboard__note">Zjednodušená mriežka podľa približnej polohy krajov, nie geografická mapa.</p>
          </div>

          <div>
            <h3 className="dashboard__subheading">Poradie krajov, zvolený rok</h3>
            <div className="dashboard__ranklist">
              {rankedRows.map((row) => {
                const value = metricValue(row)
                const pct = maxValue ? Math.max(4, ((value ?? 0) / maxValue) * 100) : 0
                const selected = row.region === selectedRegion
                return (
                  <button
                    type="button"
                    key={row.region}
                    className="dashboard__rank-row"
                    onClick={() => setSelectedRegion(row.region)}
                  >
                    <span className={selected ? 'dashboard__rank-name dashboard__rank-name--selected' : 'dashboard__rank-name'}>
                      {row.region}
                    </span>
                    <span className="dashboard__rank-bar-bg">
                      <span
                        className={selected ? 'dashboard__rank-bar dashboard__rank-bar--selected' : 'dashboard__rank-bar'}
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="dashboard__rank-value">{displayValue(value)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard__section">
        <h2 className="dashboard__section-title">
          Vývoj v čase — {selectedRegion}
          {insurerFilter !== 'all' ? ` (${INSURER_LABELS[insurerFilter]})` : ''}
        </h2>
        <div className="dashboard__chart">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => (metric === 'capita' ? formatPercent1(value) : formatCount(value))} />
              <Tooltip formatter={(value) => displayValue(value)} />
              <Line type="monotone" dataKey="value" name={selectedRegion} stroke="#2a78d6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <InsightsList title="Kľúčové zistenia — kraje" items={insights} />
    </>
  )
}
