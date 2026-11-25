import { Component } from 'react'
import ErrorView from './ErrorView'

// Zabezpieczenie na wypadek nieoczekiwanego błędu w kodzie interfejsu.
// Zamiast pustej białej strony użytkownik widzi ekran błędu z przyciskiem odświeżenia strony.
class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorView
          message="Wystąpił nieoczekiwany błąd aplikacji."
          onRetry={() => window.location.reload()}
        />
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
