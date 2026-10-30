import { useEffect, useRef, useState } from 'react'
import { Alert, Form, Spinner } from 'react-bootstrap'
import { createBooking, getMyBookings } from '../api/bookings'
import { getClasses } from '../api/classes'
import ClassRow from '../components/ClassRow'
import WeekStrip from '../components/WeekStrip'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import { addDays, fromKey, startOfWeek, toKey } from '../utils/dates'

function SchedulePage() {
  const { user } = useAuth()
  const notify = useToast()
  const userId = user ? user.id : null

  const [classes, setClasses] = useState([])
  const [bookedIds, setBookedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [selectedKey, setSelectedKey] = useState(() => toKey(new Date()))
  const [instructor, setInstructor] = useState('all')
  const [busyId, setBusyId] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const initialized = useRef(false)

  useEffect(() => {
    let active = true
    const bookingsRequest = userId ? getMyBookings() : Promise.resolve([])
    Promise.all([getClasses(), bookingsRequest])
      .then(([classData, bookingData]) => {
        if (!active) return
        setClasses(classData)
        setBookedIds(new Set(bookingData.map((b) => b.fitness_class)))
        setError(null)
        if (!initialized.current && classData.length > 0) {
          initialized.current = true
          const firstKey = classData.map((c) => c.start_time.slice(0, 10)).sort()[0]
          setSelectedKey(firstKey)
          setWeekStart(startOfWeek(fromKey(firstKey)))
        }
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [userId, reloadKey])

  const handleBook = async (classId) => {
    setBusyId(classId)
    try {
      await createBooking(classId)
      notify('Zapisano na zajęcia.')
    } catch (err) {
      notify(err.message, 'danger')
    } finally {
      setBusyId(null)
      setReloadKey((k) => k + 1)
    }
  }

  if (loading) return <Spinner animation="border" />
  if (error) return <Alert variant="danger">{error}</Alert>

  const instructors = [...new Set(classes.map((c) => c.instructor))]
  const filtered = classes.filter((c) => instructor === 'all' || c.instructor === instructor)
  const daysWithClasses = new Set(filtered.map((c) => c.start_time.slice(0, 10)))
  const visible = filtered
    .filter((c) => c.start_time.slice(0, 10) === selectedKey)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const changeWeek = (days) => {
    const newStart = addDays(weekStart, days)
    setWeekStart(newStart)
    setSelectedKey(toKey(newStart))
  }

  const weekEnd = addDays(weekStart, 6)
  const dayLabel = fromKey(selectedKey).toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <>
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1">Grafik zajęć</h1>
          <div className="text-muted">
            {weekStart.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })} –{' '}
            {weekEnd.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <Form.Group controlId="instructor-filter">
          <Form.Label className="small text-muted mb-1">Instruktor</Form.Label>
          <Form.Select value={instructor} onChange={(e) => setInstructor(e.target.value)}>
            <option value="all">Wszyscy instruktorzy</option>
            {instructors.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      <WeekStrip
        weekStart={weekStart}
        selectedKey={selectedKey}
        daysWithClasses={daysWithClasses}
        onSelect={setSelectedKey}
        onPrev={() => changeWeek(-7)}
        onNext={() => changeWeek(7)}
      />

      <h2 className="h5 mb-3 text-capitalize">{dayLabel}</h2>

      {visible.length === 0 ? (
        <Alert variant="light" className="border">Brak zajęć tego dnia.</Alert>
      ) : (
        <div className="d-flex flex-column gap-3">
          {visible.map((c) => (
            <ClassRow
              key={c.id}
              item={c}
              isBooked={bookedIds.has(c.id)}
              canBook={Boolean(user)}
              busy={busyId === c.id}
              onBook={handleBook}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default SchedulePage