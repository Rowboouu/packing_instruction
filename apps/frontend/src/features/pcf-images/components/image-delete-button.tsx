import { Icons } from '@/components/icons';
import { QUERY_KEYS } from '@/constant/query-key';
import { AssortmentPCF } from '@/features/assortments';
import { useModalStore } from '@/lib/store/modalStore';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PcfImage, useDeletePCFImage } from '..';

interface Props {
  assortmentId: string;
  item: File | PcfImage;
  onDeleteClick?: (item: File | PcfImage) => void;
}

export function ImageDeleteButton({
  assortmentId,
  item,
  onDeleteClick,
}: Props) {
  const { t } = useTranslation();
  const { setModal, closeModal } = useModalStore();
  const queryClient = useQueryClient();

  const assortment = queryClient.getQueryData<AssortmentPCF>([
    QUERY_KEYS.ASSORTMENTS,
    assortmentId,
  ]);

  const deleteImage = useDeletePCFImage({
    onMutate: (itemId) => {
      queryClient.setQueryData<AssortmentPCF>(
        [QUERY_KEYS.ASSORTMENTS, assortmentId],
        (old: AssortmentPCF | undefined) => ({
          ...old!,
          pcfImages: old?.pcfImages.filter((pcf) => pcf._id !== itemId) || [],
        }),
      );
      return { prevAssortment: assortment };
    },
    onError: (_err, _newTodo, context) => {
      const prev = context as { prevAssortment?: AssortmentPCF };
      queryClient.setQueryData(
        [QUERY_KEYS.ASSORTMENTS, assortmentId],
        prev.prevAssortment,
      );
    },
    onSuccess: () => {
      toast.success('Image deleted successfully');
    },
  });

  function handleDeleteClick() {
    setModal({
      component: {
        title: 'Delete Image',
        body: `Are you sure you want to delete this image?`,
        footer: (
          <>
            <Button
              variant="danger"
              onClick={() => {
                if ('_id' in item) {
                  deleteImage.mutate(item._id);
                }
                closeModal();
                onDeleteClick?.(item);
              }}
            >
              <span className="px-2">Delete</span>
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
      <span className="ms-2 fs-0">{t(`keyButton_delete`)}</span>
    </button>
  );
}
