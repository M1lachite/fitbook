import { Button, Card, Form } from 'react-bootstrap'

function LoginPage() {
  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <Card className="mx-auto" style={{ maxWidth: 420 }}>
      <Card.Body className="p-4">
        <h1 className="h3 mb-4">Logowanie</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="login-email">
            <Form.Label>Adres e-mail</Form.Label>
            <Form.Control type="email" placeholder="jan@example.com" />
          </Form.Group>
          <Form.Group className="mb-4" controlId="login-password">
            <Form.Label>Hasło</Form.Label>
            <Form.Control type="password" />
          </Form.Group>
          <Button type="submit" className="w-100">Zaloguj się</Button>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default LoginPage