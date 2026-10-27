import { useEffect, useState } from 'react'
import { Alert, Button, Spinner, Table } from 'react-bootstrap'
import { createClass, deleteClass, getClasses, updateClass } from '../api/classes'
import ClassFormModal from '../components/ClassFormModal'
import ConfirmModal from '../components/ConfirmModal'
import ParticipantsModal from '../components/ParticipantsModal'
import { useToast } from '../context/useToast'

function InstructorPage() {
  const notify = useToast()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [formTarget, setFormTarget] = useState(null)
  const [participantsTarget, setParticipantsTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true
    getClasses()
      .then((data) => {
        if (active) {
          setClasses(data)
          setError(null)
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
  }, [reloadKey])

  const reload = () => setReloadKey((k) => k + 1)

  const handleSave = async (data) => {
    if (formTarget === 'new') {
      await createClass(data)
      notify('Zajęcia zostały dodane.')
    } else {
      await updateClass(formTarget.id, data)
      notify('Zmiany zostały zapisane.')
    }
    setFormTarget(null)
    reload()
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteClass(deleteTarget.id)
      notify('Zajęcia zostały usunięte.')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      notify(err.message, 'danger')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner animation="border" />
  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">Panel instruktora</h1>
        <Button onClick={() => setFormTarget('new')}>Dodaj zajęcia</Button>
      </div>

      {classes.length === 0 ? (
        <Alert variant="light" className="border">Nie ma jeszcze żadnych zajęć. Dodaj pierwsze.</Alert>
      ) : (
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
                <td className="text-end text-nowrap">
                  <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => setParticipantsTarget(c)}>
                    Uczestnicy
                  </Button>
                  <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => setFormTarget(c)}>
                    Edytuj
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => setDeleteTarget(c)}>
                    Usuń
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {formTarget && (
        <ClassFormModal
          initial={formTarget === 'new' ? null : formTarget}
          onSave={handleSave}
          onClose={() => setFormTarget(null)}
        />
      )}
      {participantsTarget && (
        <ParticipantsModal item={participantsTarget} onClose={() => setParticipantsTarget(null)} />
      )}
      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Usuwanie zajęć"
        message={
          deleteTarget
            ? `Czy na pewno usunąć zajęcia „${deleteTarget.title}"? Zostaną też usunięte zapisy (${deleteTarget.booked}).`
            : ''
        }
        confirmLabel="Usuń"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}

export default InstructorPage