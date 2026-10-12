export function toKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date, n) {
  const result = new Date(date)
  result.setDate(result.getDate() + n)
  return result
}

export function startOfWeek(date) {
  const shift = (date.getDay() + 6) % 7
  return addDays(date, -shift)
}