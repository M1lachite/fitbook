import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { Button, Container, Nav, Navbar } from 'react-bootstrap'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/useAuth'
import { useToast } from './context/useToast'
import InstructorPage from './pages/InstructorPage'
import LoginPage from './pages/LoginPage'
import MyBookingsPage from './pages/MyBookingsPage'
import RegisterPage from './pages/RegisterPage'
import SchedulePage from './pages/SchedulePage'
import UsersPage from './pages/UsersPage'

const ROLE_LABELS = {
  CLIENT: 'klient',
  INSTRUCTOR: 'instruktor',
  ADMIN: 'administrator',
}

function App() {
  const { user, logout } = useAuth()
  const notify = useToast()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    notify('Wylogowano.')
    navigate('/')
  }

  const isStaff = user && (user.role === 'INSTRUCTOR' || user.role === 'ADMIN')

  return (
    <>
      <Navbar expand="md" bg="white" className="border-bottom mb-4">
        <Container style={{ maxWidth: 1040 }}>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">FitBook</Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/" end>Grafik zajęć</Nav.Link>
              {user && <Nav.Link as={NavLink} to="/my-bookings">Moje rezerwacje</Nav.Link>}
              {isStaff && <Nav.Link as={NavLink} to="/instructor">Panel instruktora</Nav.Link>}
              {user && user.role === 'ADMIN' && <Nav.Link as={NavLink} to="/users">Użytkownicy</Nav.Link>}
            </Nav>
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted">
                  {user.username} ({ROLE_LABELS[user.role]})
                </span>
                <Button variant="outline-primary" onClick={handleLogout}>Wyloguj</Button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Button as={Link} to="/register" variant="outline-primary">Zarejestruj</Button>
                <Button as={Link} to="/login">Zaloguj</Button>
              </div>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container style={{ maxWidth: 1040 }}>
        <Routes>
          <Route path="/" element={<SchedulePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor"
            element={
              <ProtectedRoute roles={['INSTRUCTOR', 'ADMIN']}>
                <InstructorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
                <ProtectedRoute roles={['ADMIN']}>
                    <UsersPage />
                </ProtectedRoute>
            }
           />
        </Routes>
      </Container>
    </>
  )
}

export default App