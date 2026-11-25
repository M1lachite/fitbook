import { Button, Card } from 'react-bootstrap'

// Ekran błędu pokazywany zamiast pustej strony, gdy nie udało się pobrać danych z serwera.
// Komponent wyświetla komunikat dla użytkownika i przycisk, który ponawia próbę.
function ErrorView({ message, onRetry }) {
  return (
    <Card className="mx-auto text-center" style={{ maxWidth: 520 }}>
      <Card.Body className="p-4">
        <h1 className="h4 mb-3">Coś poszło nie tak</h1>
        <p className="text-muted mb-4">{message}</p>
        <Button onClick={onRetry}>Spróbuj ponownie</Button>
      </Card.Body>
    </Card>
  )
}

export default ErrorView
