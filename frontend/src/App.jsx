import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { Button, Container, Nav, Navbar } from 'react-bootstrap'
import SchedulePage from './pages/SchedulePage'
import MyBookingsPage from './pages/MyBookingsPage'
import LoginPage from './pages/LoginPage'
import InstructorPage from './pages/InstructorPage'

function App() {
  return (
    <>
      <Navbar bg="white" className="border-bottom mb-4">
        <Container style={{ maxWidth: 1040 }}>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">FitBook</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>Grafik zajęć</Nav.Link>
            <Nav.Link as={NavLink} to="/my-bookings">Moje rezerwacje</Nav.Link>
            <Nav.Link as={NavLink} to="/instructor">Panel instruktora</Nav.Link>
          </Nav>
          <Button as={Link} to="/login" variant="outline-primary">Zaloguj</Button>
        </Container>
      </Navbar>
      <Container style={{ maxWidth: 1040 }}>
        <Routes>
          <Route path="/" element={<SchedulePage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/instructor" element={<InstructorPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Container>
    </>
  )
}

export default App