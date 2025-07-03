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

export async function uploadAssormentImage({
  _id,
  ...data
}: UploadAssortmentImageDTO) {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key as keyof UploadImageDTO];
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((file, index) => {
        formData.append(`${key}[${index}]`, file);
      });
    } else if (typeof value === 'object' && value !== null) {
      // Handle imageLabels object
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(key, value as string | Blob);
    }
  });

  const res = await api.patch(`/zulu-assortments/${_id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

type MutationFnType = typeof uploadAssormentImage;

export function useUploadAssortmentImage(
  options?: MutationConfig<MutationFnType>,
) {
  return useMutation({
    ...options,
    mutationFn: uploadAssormentImage,
  });
}
