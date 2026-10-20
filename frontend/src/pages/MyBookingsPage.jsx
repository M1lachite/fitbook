import { useEffect, useState } from 'react'
import { Alert, Button, Spinner, Table } from 'react-bootstrap'
import { getMyBookings } from '../api/bookings'

function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

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
                  <Button variant="outline-danger" size="sm">Anuluj</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}

export default MyBookingsPage