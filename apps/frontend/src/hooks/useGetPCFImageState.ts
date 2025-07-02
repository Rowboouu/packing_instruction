import { PcfImage } from '@/features/pcf-images';

const useGETPCFImageState = (item: File | PcfImage) => {
  const canUpdate = typeof item === 'object' && !(item instanceof File);
  const canRetake = canUpdate && item.isApproved === true;
  const isRetake = canUpdate && item.isApproved === false;
  const isBarcodeError = canUpdate && (item?.barcodeErrors?.length ?? 0) > 0;

  return { canUpdate, canRetake, isRetake, isBarcodeError };
};

export default useGETPCFImageState;
