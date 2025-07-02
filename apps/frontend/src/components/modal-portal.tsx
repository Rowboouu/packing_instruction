import { useModalStore } from '@/lib/store/modalStore';
import { Modal } from 'react-bootstrap';

export function ModalPortal() {
  const { component, option, closeModal } = useModalStore();

  return (
    <Modal
      {...option}
      show={Boolean(component)}
      onHide={closeModal}
      backdrop="static"
    >
      <Modal.Header closeButton>
        {component?.title && <Modal.Title>{component.title}</Modal.Title>}
      </Modal.Header>
      {component?.body && <Modal.Body>{component.body}</Modal.Body>}
      {component?.footer && <Modal.Footer>{component.footer}</Modal.Footer>}
    </Modal>
  );
}
