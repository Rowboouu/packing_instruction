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
        (old: AssortmentPCF | undefined) => {
          if (!old) return old;
          
          // FIX: Maintain the correct pcfImages structure
          const updatedPcfImages = { ...old.pcfImages };
          
          // Update across all image categories
          if (updatedPcfImages.itemPackImages) {
            updatedPcfImages.itemPackImages = updatedPcfImages.itemPackImages.map((packArray: any[]) =>
              packArray.map((pcf: any) =>
                pcf._id === _id ? { ...pcf, isApproved } : pcf
              )
            );
          }
          
          if (updatedPcfImages.itemBarcodeImages) {
            updatedPcfImages.itemBarcodeImages = updatedPcfImages.itemBarcodeImages.map((pcf: any) =>
              pcf._id === _id ? { ...pcf, isApproved } : pcf
            );
          }
          
          if (updatedPcfImages.displayImages) {
            updatedPcfImages.displayImages = updatedPcfImages.displayImages.map((pcf: any) =>
              pcf._id === _id ? { ...pcf, isApproved } : pcf
            );
          }
          
          if (updatedPcfImages.innerCartonImages) {
            updatedPcfImages.innerCartonImages = updatedPcfImages.innerCartonImages.map((pcf: any) =>
              pcf._id === _id ? { ...pcf, isApproved } : pcf
            );
          }
          
          if (updatedPcfImages.masterCartonImages) {
            updatedPcfImages.masterCartonImages = updatedPcfImages.masterCartonImages.map((pcf: any) =>
              pcf._id === _id ? { ...pcf, isApproved } : pcf
            );
          }

          return {
            ...old,
            pcfImages: updatedPcfImages,
          };
        },
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