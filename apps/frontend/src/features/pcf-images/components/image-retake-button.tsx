import { Icons } from '@/components/icons';
import { QUERY_KEYS } from '@/constant/query-key';
import { AssortmentPCF } from '@/features/assortments';
import { queryClient } from '@/lib/react-query';
import { t } from 'i18next';
import { toast } from 'sonner';
import { PcfImage, UpdatePCFImageStatusDTO, useUpdatePCFImageStatus } from '..';

interface Props {
  assortmentId: string;
  item: File | PcfImage;
}

export function ImageRetakeButton({ assortmentId, item }: Props) {
  const assortment = queryClient.getQueryData<AssortmentPCF>([
    QUERY_KEYS.ASSORTMENTS,
    assortmentId,
  ]);

  const retakeImage = useUpdatePCFImageStatus({
    onMutate: async (variable) => {
      const { _id, isApproved } = variable as UpdatePCFImageStatusDTO;
      queryClient.setQueryData<AssortmentPCF>(
        [QUERY_KEYS.ASSORTMENTS, assortmentId],
        (old: AssortmentPCF | undefined) => ({
          ...old!,
          pcfImages:
            old?.pcfImages.map((pcf) =>
              pcf._id === _id ? { ...pcf, isApproved } : pcf,
            ) || [],
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
      toast.success('Updated image status successfully');
    },
  });

  function handleOnRetake() {
    if ('_id' in item) {
      retakeImage.mutate({ _id: item._id, isApproved: false });
    }
  }

  return (
    <button className="dropdown-item" onClick={handleOnRetake}>
      <Icons.Camera height={14} width={14} />
      <span className="ms-2 fs-0">{t(`keyButton_retake`)}</span>
    </button>
  );
}
