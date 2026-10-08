import { Button } from 'react-bootstrap'
import { addDays, toKey } from '../utils/dates'

const DAY_NAMES = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']

function WeekStrip({ weekStart, selectedKey, daysWithClasses, onSelect, onPrev, onNext }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="d-flex align-items-center gap-2 mb-4">
      <Button variant="outline-secondary" aria-label="Poprzedni tydzień" onClick={onPrev}>
        ‹
      </Button>
      <div className="flex-grow-1 d-grid gap-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map((day, i) => {
          const key = toKey(day)
          const selected = key === selectedKey
          const hasClasses = daysWithClasses.has(key)
          return (
            <Button
              key={key}
              variant={selected ? 'primary' : 'light'}
              className="border"
              onClick={() => onSelect(key)}
            >
              <div className="small">{DAY_NAMES[i]}</div>
              <div className="fw-bold">
                {day.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}
              </div>
              <div style={{ height: 6, opacity: hasClasses ? 1 : 0 }}>•</div>
            </Button>
          )
        })}
      </div>
      <Button variant="outline-secondary" aria-label="Następny tydzień" onClick={onNext}>
        ›
      </Button>
    </div>
  )
}

export default WeekStrip