import { useTranslation } from 'react-i18next';
import { Button } from 'react-bootstrap';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { useModalStore } from '@/lib/store/modalStore';
import { PcfImage } from '@/features/pcf-images';

interface Props {
  item: File | PcfImage;
  onStageForDelete: (filename: string) => void;
}

export function ImageDeleteButton({ item, onStageForDelete }: Props) {
  const { t } = useTranslation();
  const { setModal, closeModal } = useModalStore();

  function handleDeleteClick() {
    if (!('filename' in item) || !item.filename) {
      toast.error("This image hasn't been saved yet and cannot be deleted.");
      return;
    }

    setModal({
      component: {
        title: 'Mark for Deletion',
        body: `This image will be permanently deleted when you save your changes. Are you sure?`,
        footer: (
          <>
            <Button
              variant="danger"
              onClick={() => {
                onStageForDelete(item.filename!);
                closeModal();
              }}
            >
              <span className="px-2">Yes, Mark for Deletion</span>
            </Button>
            <Button variant="outline-secondary" onClick={closeModal}>
              Cancel
            </Button>
          </>
        ),
      },
    });
  }

  return (
    <button className="dropdown-item" onClick={handleDeleteClick}>
      <Icons.Trash height={14} width={14} />
      <span className="ms-2 fs-0">{t('keyButton_delete')}</span>
    </button>
  );
}