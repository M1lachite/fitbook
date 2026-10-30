import { useState } from 'react'
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useToast } from '../context/useToast'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function RegisterPage() {
  const notify = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const validate = () => {
    const found = {}
    if (form.username.trim().length < 3) found.username = 'Nazwa użytkownika musi mieć co najmniej 3 znaki.'
    if (!EMAIL_PATTERN.test(form.email)) found.email = 'Podaj poprawny adres e-mail.'
    if (!form.first_name.trim()) found.first_name = 'Podaj imię.'
    if (!form.last_name.trim()) found.last_name = 'Podaj nazwisko.'
    if (form.password.length < 8) found.password = 'Hasło musi mieć co najmniej 8 znaków.'
    if (form.password2 !== form.password) found.password2 = 'Hasła nie są takie same.'
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
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        password: form.password,
      })
      notify('Konto zostało utworzone. Możesz się zalogować.')
      navigate('/login')
    } catch (err) {
      setServerError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const field = (name, label, type = 'text', autoComplete) => (
    <Form.Group className="mb-3" controlId={`register-${name}`}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type={type}
        value={form[name]}
        onChange={change(name)}
        isInvalid={Boolean(errors[name])}
        autoComplete={autoComplete}
      />
      <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
    </Form.Group>
  )

  return (
    <Card className="mx-auto" style={{ maxWidth: 480 }}>
      <Card.Body className="p-4">
        <h1 className="h3 mb-4">Rejestracja</h1>
        {serverError && <Alert variant="danger">{serverError}</Alert>}
        <Form noValidate onSubmit={handleSubmit}>
          {field('username', 'Nazwa użytkownika', 'text', 'username')}
          {field('email', 'Adres e-mail', 'email', 'email')}
          {field('first_name', 'Imię', 'text', 'given-name')}
          {field('last_name', 'Nazwisko', 'text', 'family-name')}
          {field('password', 'Hasło', 'password', 'new-password')}
          {field('password2', 'Powtórz hasło', 'password', 'new-password')}
          <Button type="submit" className="w-100" disabled={submitting}>
            {submitting ? <Spinner size="sm" animation="border" /> : 'Utwórz konto'}
          </Button>
        </Form>
        <div className="text-center mt-3">
          Masz już konto? <Link to="/login">Zaloguj się</Link>
        </div>
      </Card.Body>
    </Card>
  )
}

export default RegisterPage