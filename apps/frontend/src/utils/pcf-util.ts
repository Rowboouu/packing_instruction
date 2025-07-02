import { UploadImageDTO } from '@/features/assortments';
import { PcfImage } from '@/features/pcf-images';

export function groupPCFImages(images: PcfImage[]) {
  return images.reduce(
    (acc, curr) => {
      const field = curr.field as keyof UploadImageDTO;
      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push(curr);
      return acc;
    },
    {} as Record<keyof UploadImageDTO, PcfImage[]>,
  );
}

export function getPCFImageSrc(item: File | PcfImage) {
  const imgSrc =
    typeof item === 'object' && item instanceof File
      ? URL.createObjectURL(item)
      : `/api/files/static/${item.fileData.filename}`;

  return imgSrc;
}
