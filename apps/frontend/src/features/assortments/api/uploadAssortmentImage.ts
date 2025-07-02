import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';
import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

export const uploadImageSchema = z.object({
  masterUccLabel: z.instanceof(File).optional(),
  masterShippingMark: z.instanceof(File).optional(),
  masterCarton: z.instanceof(File).optional(),
  innerItemLabel: z.instanceof(File).optional(),
  innerUccLabel: z.instanceof(File).optional(),
  innerItemUccLabel: z.instanceof(File).optional(),
  innerCarton: z.instanceof(File).optional(),
  upcLabelFront: z.instanceof(File).optional(),
  upcLabelBack: z.instanceof(File).optional(),
  upcPlacement: z.array(z.instanceof(File)).optional(),
  productPictures: z.array(z.instanceof(File)).optional(),
  protectivePackaging: z.array(z.instanceof(File)).optional(),
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
      value.forEach((file) => {
        formData.append(key, file);
      });
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
