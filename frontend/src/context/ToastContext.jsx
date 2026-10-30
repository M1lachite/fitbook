import { useCallback, useState } from 'react'
import { Toast, ToastContainer } from 'react-bootstrap'
import { ToastContext } from './toast-context'

let nextId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback((message, variant = 'success') => {
    const id = nextId++
    setToasts((current) => [...current, { id, message, variant }])
  }, [])

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <ToastContainer position="top-end" containerPosition="fixed" className="p-3">
        {toasts.map((t) => (
          <Toast key={t.id} bg={t.variant} autohide delay={4000} onClose={() => remove(t.id)}>
            <Toast.Body className="text-white">{t.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  )
}