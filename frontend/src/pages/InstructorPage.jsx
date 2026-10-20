import { useEffect, useState } from 'react'
import { Alert, Button, Spinner, Table } from 'react-bootstrap'
import { getClasses } from '../api/classes'

function InstructorPage() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getClasses()
      .then(setClasses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner animation="border" />
  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">Panel instruktora</h1>
        <Button>Dodaj zajęcia</Button>
      </div>
      <Table responsive className="bg-white border align-middle">
        <thead>
          <tr>
            <th>Zajęcia</th>
            <th>Instruktor</th>
            <th>Termin</th>
            <th>Zapisani</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {classes.map((c) => (
            <tr key={c.id}>
              <td className="fw-bold">{c.title}</td>
              <td>{c.instructor}</td>
              <td>
                {new Date(c.start_time).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })}
              </td>
              <td>{c.booked} / {c.capacity}</td>
              <td className="text-end">
                <Button variant="outline-secondary" size="sm" className="me-2">Uczestnicy</Button>
                <Button variant="outline-secondary" size="sm" className="me-2">Edytuj</Button>
                <Button variant="outline-danger" size="sm">Usuń</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default InstructorPage