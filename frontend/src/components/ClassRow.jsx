import { Badge, Button, Card, ProgressBar } from 'react-bootstrap'

function ClassRow({ item }) {
  const free = item.capacity - item.booked
  const isFull = free === 0
  const isLast = free > 0 && free <= 3
  const barVariant = isFull ? 'secondary' : isLast ? 'warning' : 'primary'
  const time = new Date(item.start_time).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card className={isFull ? 'bg-light' : ''}>
      <Card.Body className="d-flex flex-wrap align-items-center gap-3">
        <div className="fs-4 fw-bold" style={{ width: 80 }}>{time}</div>
        <div className="flex-grow-1" style={{ minWidth: 200 }}>
          <div className="fs-5 fw-bold">
            {item.title}{' '}
            {isLast && <Badge bg="warning" text="dark">Ostatnie miejsca</Badge>}
          </div>
          <div className="text-muted">{item.instructor} · {item.description}</div>
        </div>
        <div style={{ width: 200 }}>
          <div className="small fw-medium mb-1">
            {isFull ? `Brak miejsc (${item.capacity} z ${item.capacity})` : `Wolne miejsca: ${free} z ${item.capacity}`}
          </div>
          <ProgressBar now={item.booked} max={item.capacity} variant={barVariant} style={{ height: 8 }} />
        </div>
        <Button disabled={isFull}>{isFull ? 'Brak miejsc' : 'Zapisz się'}</Button>
      </Card.Body>
    </Card>
  )
}

export default ClassRow