import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';
import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

export const uploadImageSchema = z.object({
  itemBarcodeImages: z.array(z.instanceof(File)).optional(),
  displayImages: z.array(z.instanceof(File)).optional(),
  innerCartonImages: z.array(z.instanceof(File)).optional(),
  masterCartonImages: z.array(z.instanceof(File)).optional(),
  itemPackImages: z.array(z.instanceof(File)).optional(),
  imageLabels: z.record(z.string()).optional(),
});

export type UploadImageDTO = z.infer<typeof uploadImageSchema>;

export const uploadAssortmentImageSchema = uploadImageSchema.extend({
  _id: z.string(),
});

export type UploadAssortmentImageDTO = z.infer<
  typeof uploadAssortmentImageSchema
>;

export async function uploadImages({
  _id,
  ...data
}: {
  _id: string;
} & UploadImageDTO) {
  const formData = new FormData();
  // ... keep your existing FormData logic ...

  const res = await api.patch(
    `/packing-instruction/assortment/${_id}/images`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return res.data;
}

export function useUploadImages(options?: MutationConfig<typeof uploadImages>) {
  return useMutation({
    ...options,
    mutationFn: uploadImages,
  });
}

type MutationFnType = typeof uploadImages;

export function useUploadAssortmentImage(
  options?: MutationConfig<MutationFnType>,
) {
  return useMutation({
    ...options,
    mutationFn: uploadImages,
  });
}
