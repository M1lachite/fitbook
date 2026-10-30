import { useEffect, useState } from 'react'
import { Alert, Button, Spinner, Table } from 'react-bootstrap'
import { deleteBooking, getMyBookings } from '../api/bookings'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../context/useToast'

function MyBookingsPage() {
  const notify = useToast()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [target, setTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await deleteBooking(target.id)
      setBookings((current) => current.filter((b) => b.id !== target.id))
      notify('Rezerwacja została anulowana.')
      setTarget(null)
    } catch (err) {
      notify(err.message, 'danger')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <Spinner animation="border" />
  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <>
      <h1 className="h2 mb-4">Moje rezerwacje</h1>
      {bookings.length === 0 ? (
        <Alert variant="light" className="border">Nie masz jeszcze żadnych rezerwacji.</Alert>
      ) : (
        <Table responsive className="bg-white border align-middle">
          <thead>
            <tr>
              <th>Zajęcia</th>
              <th>Instruktor</th>
              <th>Termin</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="fw-bold">{b.class_title}</td>
                <td>{b.instructor}</td>
                <td>
                  {new Date(b.start_time).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td className="text-end">
                  <Button variant="outline-danger" size="sm" onClick={() => setTarget(b)}>
                    Anuluj rezerwację
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <ConfirmModal
        show={Boolean(target)}
        title="Anulowanie rezerwacji"
        message={target ? `Czy na pewno anulować rezerwację: ${target.class_title}?` : ''}
        confirmLabel="Anuluj rezerwację"
        busy={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setTarget(null)}
      />
    </>
  )
}

export default MyBookingsPage