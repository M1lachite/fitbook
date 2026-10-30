import { useState } from 'react'
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'

function LoginPage() {
  const { login } = useAuth()
  const notify = useToast()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const found = {}
    if (!username.trim()) found.username = 'Podaj nazwę użytkownika.'
    if (!password) found.password = 'Podaj hasło.'
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
      await login(username.trim(), password)
      notify('Zalogowano pomyślnie.')
      navigate('/')
    } catch (err) {
      setServerError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto" style={{ maxWidth: 420 }}>
      <Card.Body className="p-4">
        <h1 className="h3 mb-4">Logowanie</h1>
        {serverError && <Alert variant="danger">{serverError}</Alert>}
        <Form noValidate onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="login-username">
            <Form.Label>Nazwa użytkownika</Form.Label>
            <Form.Control
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              isInvalid={Boolean(errors.username)}
              autoComplete="username"
            />
            <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-4" controlId="login-password">
            <Form.Label>Hasło</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isInvalid={Boolean(errors.password)}
              autoComplete="current-password"
            />
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          </Form.Group>
          <Button type="submit" className="w-100" disabled={submitting}>
            {submitting ? <Spinner size="sm" animation="border" /> : 'Zaloguj się'}
          </Button>
        </Form>
        <div className="text-center mt-3">
          Nie masz konta? <Link to="/register">Zarejestruj się</Link>
        </div>
      </Card.Body>
    </Card>
  )
}

export default LoginPage