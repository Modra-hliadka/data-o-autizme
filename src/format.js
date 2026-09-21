export function formatCount(value) {
  return Math.round(value).toLocaleString('sk-SK')
}

export function formatPercent1(value) {
  return value.toLocaleString('sk-SK', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}
