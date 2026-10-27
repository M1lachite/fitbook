import { useState } from 'react'
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap'

function toInputValue(iso) {
  return iso ? iso.slice(0, 16) : ''
}

function ClassFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    title: initial ? initial.title : '',
    description: initial ? initial.description : '',
    instructor: initial ? initial.instructor : '',
    start_time: toInputValue(initial ? initial.start_time : ''),
    capacity: initial ? String(initial.capacity) : '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const validate = () => {
    const found = {}
    if (!form.title.trim()) found.title = 'Podaj nazwę zajęć.'
    else if (form.title.trim().length > 100) found.title = 'Nazwa może mieć maksymalnie 100 znaków.'

    if (!form.instructor.trim()) found.instructor = 'Podaj instruktora.'
    else if (form.instructor.trim().length > 100) found.instructor = 'Imię i nazwisko może mieć maksymalnie 100 znaków.'

    if (!form.start_time) found.start_time = 'Wybierz termin zajęć.'
    else if (!initial && new Date(form.start_time) < new Date()) {
      found.start_time = 'Termin nie może być w przeszłości.'
    }

    const capacity = Number(form.capacity)
    if (form.capacity === '' || !Number.isInteger(capacity) || capacity < 1) {
      found.capacity = 'Limit miejsc musi być liczbą całkowitą, co najmniej 1.'
    } else if (initial && capacity < initial.booked) {
      found.capacity = `Limit nie może być mniejszy niż liczba zapisanych osób (${initial.booked}).`
    }
    return found
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    setServerError(null)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        instructor: form.instructor.trim(),
        start_time: form.start_time,
        capacity: Number(form.capacity),
      })
    } catch (err) {
      setServerError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <Modal show onHide={onClose} centered>
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{initial ? 'Edycja zajęć' : 'Nowe zajęcia'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {serverError && <Alert variant="danger">{serverError}</Alert>}
          <Form.Group className="mb-3" controlId="class-title">
            <Form.Label>Nazwa zajęć</Form.Label>
            <Form.Control value={form.title} onChange={change('title')} isInvalid={Boolean(errors.title)} />
            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="class-instructor">
            <Form.Label>Instruktor</Form.Label>
            <Form.Control value={form.instructor} onChange={change('instructor')} isInvalid={Boolean(errors.instructor)} />
            <Form.Control.Feedback type="invalid">{errors.instructor}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="class-description">
            <Form.Label>Opis (opcjonalnie)</Form.Label>
            <Form.Control as="textarea" rows={3} value={form.description} onChange={change('description')} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="class-start">
            <Form.Label>Termin</Form.Label>
            <Form.Control type="datetime-local" value={form.start_time} onChange={change('start_time')} isInvalid={Boolean(errors.start_time)} />
            <Form.Control.Feedback type="invalid">{errors.start_time}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="class-capacity">
            <Form.Label>Limit miejsc</Form.Label>
            <Form.Control type="number" min="1" value={form.capacity} onChange={change('capacity')} isInvalid={Boolean(errors.capacity)} />
            <Form.Control.Feedback type="invalid">{errors.capacity}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose} disabled={submitting}>Wróć</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner size="sm" animation="border" /> : 'Zapisz'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ClassFormModal