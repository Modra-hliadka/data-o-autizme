import insuranceHistory from '../../data/insuranceHistory.json'
import regionPopulation from '../../data/regionPopulation.json'
import KpiCards from './KpiCards.jsx'
import TrendChart from './TrendChart.jsx'
import InsightsList from './InsightsList.jsx'
import { formatCount, formatPercent1 } from '../format.js'

const { years, insurers } = insuranceHistory

function totalForYear(year) {
  const index = years.indexOf(year)
  return insurers.reduce((sum, insurer) => sum + insurer.values[index], 0)
}

export default function OverviewTab() {
  const lastYear = years[years.length - 1]
  const prevYear = years[years.length - 2]
  const firstYear = years[0]

  const last = totalForYear(lastYear)
  const prev = totalForYear(prevYear)
  const first = totalForYear(firstYear)
  const yoy = ((last - prev) / prev) * 100
  const multiplier = last / first
  // population of Slovakia at 31.12. of the last year = sum over the 8 regions (ŠÚ SR); null if not available yet
  const populationIndex = regionPopulation.years.indexOf(lastYear)
  const totalPopulation =
    populationIndex === -1
      ? null
      : Object.values(regionPopulation.populationByRegion).reduce((sum, values) => sum + values[populationIndex], 0)
  const perCapita = totalPopulation ? (last / totalPopulation) * 10000 : null

  const kpis = [
    {
      label: `Poistenci s F84.x, ${lastYear}`,
      value: formatCount(last),
      delta: 'spolu VšZP + Dôvera + Union',
    },
    {
      label: `Medziročný rast ${prevYear} → ${lastYear}`,
      value: `+${formatPercent1(yoy)} %`,
      delta: `z ${formatCount(prev)} na ${formatCount(last)} osôb`,
    },
    {
      label: `Rast za ${lastYear - firstYear} rokov (${firstYear} → ${lastYear})`,
      value: `${formatPercent1(multiplier)}×`,
      delta: `z ${formatCount(first)} na ${formatCount(last)} osôb`,
    },
    {
      label: `Na 10 000 obyvateľov SR (${lastYear})`,
      value: perCapita === null ? '—' : formatPercent1(perCapita),
      delta: totalPopulation
        ? `populácia SR ${formatCount(totalPopulation)} (k 31. 12. ${lastYear})`
        : 'populácia nie je k dispozícii',
    },
  ]

  const insights = [
    <>
      Počet poistencov s diagnózou z okruhu autizmu <strong>rastie nepretržite už {lastYear - firstYear} rokov</strong> — z{' '}
      {formatCount(first)} osôb v roku {firstYear} na {formatCount(last)} v roku {lastYear} ({formatPercent1(multiplier)}
      -násobne).
    </>,
    <>
      Za posledný sledovaný rok ({prevYear} → {lastYear}) diagnostikovaných pribudlo{' '}
      <strong>+{formatPercent1(yoy)} %</strong>. Podrobný rozpad podľa poisťovne nájdeš v tabe „Poisťovne".
    </>,
    <>
      Graf nižšie si vieš obmedziť súčasne podľa poisťovne, vekovej skupiny aj kraja — filtre sú pod grafom.
    </>,
  ]

  return (
    <>
      <KpiCards items={kpis} />
      <TrendChart years={years} insurers={insurers} />
      <InsightsList title="Hlavné zistenia" items={insights} />
    </>
  )
}
