import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import ageBreakdown from '../../data/ageBreakdown.json'
import regionBreakdown from '../../data/regionBreakdown.json'
import FilterGroup from './FilterGroup.jsx'

function toggleInSet(set, id) {
  // at least one item must stay selected so the chart never goes empty
  if (set.has(id) && set.size === 1) return set

  const next = new Set(set)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  return next
}

function sumSelected(values, labels, selected) {
  return labels.reduce((sum, label, index) => (selected.has(label) ? sum + values[index] : sum), 0)
}

export default function TrendChart({ years, insurers }) {
  const [selectedInsurerIds, setSelectedInsurerIds] = useState(
    () => new Set(insurers.map((insurer) => insurer.id)),
  )
  const [selectedAgeGroups, setSelectedAgeGroups] = useState(() => new Set(ageBreakdown.ageGroups))
  const [selectedRegions, setSelectedRegions] = useState(() => new Set(regionBreakdown.regions))

  const ageAllSelected = selectedAgeGroups.size === ageBreakdown.ageGroups.length
  const regionAllSelected = selectedRegions.size === regionBreakdown.regions.length
  // age and region only come from separate breakdown tables, not a joint one —
  // combining both filters at once has to fall back to a proportional (independence) estimate
  const isApproximated = !ageAllSelected && !regionAllSelected

  const visibleInsurers = insurers.filter((insurer) => selectedInsurerIds.has(insurer.id))

  const chartData = useMemo(
    () =>
      years.map((year, yearIndex) => {
        const yearKey = String(year)
        const row = { year }

        visibleInsurers.forEach((insurer) => {
          if (ageAllSelected && regionAllSelected) {
            row[insurer.id] = insurer.values[yearIndex]
            return
          }

          const ageValues = ageBreakdown.insurers[insurer.id][yearKey]
          const ageSum = sumSelected(ageValues, ageBreakdown.ageGroups, selectedAgeGroups)

          if (regionAllSelected) {
            row[insurer.id] = ageSum
            return
          }

          const regionValues = regionBreakdown.insurers[insurer.id][yearKey]
          const regionRowTotal = regionValues.reduce((sum, value) => sum + value, 0)
          const regionSum = sumSelected(regionValues, regionBreakdown.regions, selectedRegions)

          if (ageAllSelected) {
            row[insurer.id] = regionSum
            return
          }

          const regionFraction = regionRowTotal > 0 ? regionSum / regionRowTotal : 0
          row[insurer.id] = Math.round(ageSum * regionFraction)
        })

        return row
      }),
    [years, visibleInsurers, selectedAgeGroups, selectedRegions, ageAllSelected, regionAllSelected],
  )

  return (
    <section className="dashboard__section dashboard__section--main">
      <h2 className="dashboard__section-title">
        Autizmus na Slovensku {years[0]} – {years[years.length - 1]}
      </h2>
      <div className="dashboard__chart">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => value.toLocaleString('sk-SK')} />
            <Tooltip formatter={(value) => value.toLocaleString('sk-SK')} />
            {visibleInsurers.map((insurer, index) => (
              <Bar
                key={insurer.id}
                dataKey={insurer.id}
                name={insurer.name}
                stackId="total"
                fill={insurer.color}
                radius={index === visibleInsurers.length - 1 ? [4, 4, 0, 0] : 0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        <div className="dashboard__filters">
          <FilterGroup
            title="Zdravotné poisťovne"
            items={insurers.map((insurer) => ({ id: insurer.id, label: insurer.name, color: insurer.color }))}
            selectedIds={selectedInsurerIds}
            onToggle={(id) => setSelectedInsurerIds((prev) => toggleInSet(prev, id))}
            collapsible={false}
          />
          <FilterGroup
            title="Veková štruktúra"
            items={ageBreakdown.ageGroups.map((group) => ({ id: group, label: group }))}
            selectedIds={selectedAgeGroups}
            onToggle={(id) => setSelectedAgeGroups((prev) => toggleInSet(prev, id))}
          />
          <FilterGroup
            title="Kraje"
            items={regionBreakdown.regions.map((region) => ({ id: region, label: region }))}
            selectedIds={selectedRegions}
            onToggle={(id) => setSelectedRegions((prev) => toggleInSet(prev, id))}
          />
        </div>

        {isApproximated && (
          <p className="dashboard__note">
            Pri súčasnom filtrovaní podľa veku aj kraja naraz je súčet orientačný odhad
            (predpoklad štatistickej nezávislosti oboch kategórií — presná kombinovaná
            evidencia nie je k dispozícii).
          </p>
        )}
      </div>
    </section>
  )
}
