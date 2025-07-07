// @/features/packing-instructions/api/uploadImages.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';
import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';
import { QUERY_KEYS } from '@/constant/query-key';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AssortmentData, UploadImagesDTO } from '../types';

export const uploadImagesSchema = z.object({
  _id: z.string(),
  componentNo: z.string().optional(),
  itemPackImages: z.array(z.instanceof(File)).optional(),
  itemBarcodeImages: z.array(z.instanceof(File)).optional(),
  displayImages: z.array(z.instanceof(File)).optional(),
  innerCartonImages: z.array(z.instanceof(File)).optional(),
  masterCartonImages: z.array(z.instanceof(File)).optional(),
  imageLabels: z.record(z.string()).optional(),
});

export type UploadImagesFormDTO = z.infer<typeof uploadImagesSchema>;

export async function uploadImages(
  data: UploadImagesDTO,
): Promise<AssortmentData> {
  const formData = new FormData();

  // Add componentNo if provided
  if (data.componentNo) {
    formData.append('componentNo', data.componentNo);
  }

  // Add image arrays
  const imageFields = [
    'itemPackImages',
    'itemBarcodeImages',
    'displayImages',
    'innerCartonImages',
    'masterCartonImages',
  ] as const;

  imageFields.forEach((field) => {
    const files = data[field];
    if (files && Array.isArray(files)) {
      files.forEach((file, index) => {
        formData.append(`${field}[${index}]`, file);
      });
    }
  });

  // Add image labels as JSON
  if (data.imageLabels) {
    formData.append('imageLabels', JSON.stringify(data.imageLabels));
  }

  const res = await api.patch<AssortmentData>(
    `/packing-instruction/assortment/${data._id}/images`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return res.data;
}

type MutationFnType = typeof uploadImages;

export function useUploadImages(options?: MutationConfig<MutationFnType>) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: uploadImages,
    onSuccess: (data, variables) => {
      // Update the specific assortment cache
      queryClient.setQueryData(
        [QUERY_KEYS.PACKING_INSTRUCTION, 'assortment', variables._id],
        data,
      );

      // Invalidate sales order list to update image counts
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'sales-order'],
      });

      toast.success(
        t('keyMessage_assortmentUpdatedSuccess') ||
          'Images uploaded successfully',
      );
    },
    onError: () => {
      toast.error(
        t('keyMessage_assortmentUpdatedSuccess') || 'Failed to upload images',
      );
    },
    ...options,
  });
}
