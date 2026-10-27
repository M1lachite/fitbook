import { useEffect, useState } from 'react'
import { Alert, Form, Spinner, Table } from 'react-bootstrap'
import { getUsers, updateUserRole } from '../api/users'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'

const ROLE_OPTIONS = [
  { value: 'CLIENT', label: 'Klient' },
  { value: 'INSTRUCTOR', label: 'Instruktor / recepcja' },
  { value: 'ADMIN', label: 'Administrator' },
]

function UsersPage() {
  const { user: currentUser } = useAuth()
  const notify = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingId, setSavingId] = useState(null)

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleRoleChange = async (target, role) => {
    setSavingId(target.id)
    try {
      const updated = await updateUserRole(target.id, role)
      setUsers((current) => current.map((u) => (u.id === updated.id ? updated : u)))
      if (updated.role === role) {
        notify(`Zmieniono rolę użytkownika ${target.username}.`)
      } else {
        notify('Rola tego konta nie może zostać zmieniona.', 'danger')
      }
    } catch (err) {
      notify(err.message, 'danger')
    } finally {
      setSavingId(null)
    }
  }

  if (loading) return <Spinner animation="border" />
  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <>
      <h1 className="h2 mb-4">Użytkownicy</h1>
      <Table responsive className="bg-white border align-middle">
        <thead>
          <tr>
            <th>Login</th>
            <th>Imię i nazwisko</th>
            <th>E-mail</th>
            <th style={{ width: 240 }}>Rola</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="fw-bold">{u.username}</td>
              <td>{u.first_name} {u.last_name}</td>
              <td>{u.email}</td>
              <td>
                <Form.Select
                  aria-label={`Rola użytkownika ${u.username}`}
                  value={u.role}
                  disabled={savingId === u.id || u.id === currentUser.id}
                  onChange={(e) => handleRoleChange(u, e.target.value)}
                >
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Form.Select>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default UsersPage