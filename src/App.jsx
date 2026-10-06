import { useState } from 'react'
import TabNav from './components/TabNav.jsx'
import OverviewTab from './components/OverviewTab.jsx'
import InsurersTab from './components/InsurersTab.jsx'
import RegionsTab from './components/RegionsTab.jsx'
import AgeStructureChart from './components/AgeStructureChart.jsx'
import DiagnosesTab from './components/DiagnosesTab.jsx'
import ParentGuide from './components/ParentGuide.jsx'
import ReadMore from './components/ReadMore.jsx'
import MethodologyFooter from './components/MethodologyFooter.jsx'
import insuranceHistory from '../data/insuranceHistory.json'
import './dashboard.css'

const { years } = insuranceHistory

const TABS = [
  { id: 'prehlad', label: 'Prehľad', Component: OverviewTab },
  { id: 'poistovne', label: 'Poisťovne', Component: InsurersTab },
  { id: 'kraje', label: 'Kraje', Component: RegionsTab },
  { id: 'vek', label: 'Veková štruktúra', Component: AgeStructureChart },
  { id: 'diagnozy', label: 'Diagnózy', Component: DiagnosesTab },
]

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const ActivePanel = TABS.find((tab) => tab.id === activeTab).Component

  return (
    <>
      <header className="dashboard__header">
        <h1 className="dashboard__title">Poistenci s diagnózou z okruhu autizmu (F84.x)</h1>
        <p className="dashboard__subtitle">
          Slovensko, {years[0]}–{years[years.length - 1]} · VšZP + Dôvera + Union · zdroj: agregované dáta zdravotných poisťovní.
          Poistenec je v rámci jednej poisťovne rátaný bez duplicít.
        </p>
      </header>

      <TabNav tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <ActivePanel />

      {activeTab === 'prehlad' && <ParentGuide />}

      <ReadMore />

      <MethodologyFooter />
    </>
  )
}
