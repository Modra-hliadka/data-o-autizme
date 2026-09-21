export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="dashboard__segmented">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={
            option.value === value
              ? 'dashboard__segmented-btn dashboard__segmented-btn--active'
              : 'dashboard__segmented-btn'
          }
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
