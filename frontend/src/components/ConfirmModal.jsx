import { Button, Modal, Spinner } from 'react-bootstrap'

function ConfirmModal({ show, title, message, confirmLabel = 'Potwierdź', busy, onConfirm, onCancel }) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel} disabled={busy}>Wróć</Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>
          {busy ? <Spinner size="sm" animation="border" /> : confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmModal