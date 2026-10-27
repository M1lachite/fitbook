import { useEffect, useState } from 'react'
import { Alert, Modal, Spinner, Table } from 'react-bootstrap'
import { getParticipants } from '../api/classes'

function ParticipantsModal({ item, onClose }) {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    getParticipants(item.id)
      .then((data) => {
        if (active) setParticipants(data)
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
  }, [item.id])

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Uczestnicy: {item.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}
        {!loading && !error && participants.length === 0 && (
          <Alert variant="light" className="border mb-0">Nikt jeszcze nie jest zapisany.</Alert>
        )}
        {participants.length > 0 && (
          <Table responsive className="mb-0">
            <thead>
              <tr>
                <th>Imię</th>
                <th>Nazwisko</th>
                <th>Login</th>
                <th>E-mail</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id}>
                  <td>{p.first_name}</td>
                  <td>{p.last_name}</td>
                  <td>{p.username}</td>
                  <td>{p.email}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default ParticipantsModal