import { Spinner } from 'react-bootstrap'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner animation="border" />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default ProtectedRoute