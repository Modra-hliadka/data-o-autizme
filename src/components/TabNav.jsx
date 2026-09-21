export default function TabNav({ tabs, activeTab, onChange }) {
  return (
    <div className="dashboard__tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === activeTab}
          className={tab.id === activeTab ? 'dashboard__tab dashboard__tab--active' : 'dashboard__tab'}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
