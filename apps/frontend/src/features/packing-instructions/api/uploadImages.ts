// @/features/packing-instructions/api/uploadImages.ts
// Updated to handle both traditional and webhook-sourced assortments

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
  isWebhookData: z.boolean().optional(),
  itemPackImages: z.array(z.instanceof(File)).optional(),
  itemBarcodeImages: z.array(z.instanceof(File)).optional(),
  displayImages: z.array(z.instanceof(File)).optional(),
  innerCartonImages: z.array(z.instanceof(File)).optional(),
  masterCartonImages: z.array(z.instanceof(File)).optional(),
  imageLabels: z.record(z.string()).optional(),
});

export type UploadImagesFormDTO = z.infer<typeof uploadImagesSchema>;

// Traditional API upload
export async function uploadImages(
  data: UploadImagesDTO,
): Promise<AssortmentData> {
  const formData = new FormData();

  // Add componentNo if provided
  if (data.componentNo) {
    formData.append('componentNo', data.componentNo);
  }

  // Add webhook data flag
  if (data.isWebhookData) {
    formData.append('isWebhookData', 'true');
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

  const endpoint = data.isWebhookData
    ? `/packing-instruction/webhook-assortment/${data._id}/images`
    : `/packing-instruction/assortment/${data._id}/images`;

  const res = await api.patch<AssortmentData>(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
}

// NEW: Webhook-specific image upload
export async function uploadWebhookImages(
  data: UploadImagesDTO,
): Promise<AssortmentData> {
  const formData = new FormData();

  // Add componentNo if provided
  if (data.componentNo) {
    formData.append('componentNo', data.componentNo);
  }

  // Add webhook data flag
  formData.append('isWebhookData', 'true');

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
    `/packing-instruction/webhook-assortment/${data._id}/images`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return res.data;
}

// Smart upload function
export async function uploadImagesSmart(
  data: UploadImagesDTO,
): Promise<AssortmentData> {
  if (data.isWebhookData) {
    return uploadWebhookImages(data);
  }
  return uploadImages(data);
}

type MutationFnType = typeof uploadImages;
type WebhookMutationFnType = typeof uploadWebhookImages;
type SmartMutationFnType = typeof uploadImagesSmart;

// Traditional upload hook
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
        t('keyMessage_assortmentUpdateError') || 'Failed to upload images',
      );
    },
    ...options,
  });
}

// NEW: Webhook image upload hook
export function useUploadWebhookImages(options?: MutationConfig<WebhookMutationFnType>) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: uploadWebhookImages,
    onSuccess: (data, variables) => {
      // Update the webhook assortment cache
      queryClient.setQueryData(
        [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-assortment', variables._id],
        data,
      );

      // Invalidate webhook queries to update image counts
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-sales-order'],
      });

      // Also invalidate individual assortment cache
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-assortment'],
      });

      toast.success(
        t('keyMessage_assortmentUpdatedSuccess') ||
          'Images uploaded successfully',
      );
    },
    onError: () => {
      toast.error(
        t('keyMessage_assortmentUpdateError') || 'Failed to upload images',
      );
    },
    ...options,
  });
}

// NEW: Smart upload hook that automatically chooses the right endpoint
export function useUploadImagesSmart(options?: MutationConfig<SmartMutationFnType>) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: uploadImagesSmart,
    onSuccess: (data, variables) => {
      // Update the appropriate cache based on data type
      if (variables.isWebhookData) {
        queryClient.setQueryData(
          [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-assortment', variables._id],
          data,
        );
        // Invalidate webhook queries
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-sales-order'],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-assortment'],
        });
      } else {
        queryClient.setQueryData(
          [QUERY_KEYS.PACKING_INSTRUCTION, 'assortment', variables._id],
          data,
        );
        // Invalidate traditional queries
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'sales-order'],
        });
      }

      toast.success(
        t('keyMessage_assortmentUpdatedSuccess') ||
          'Images uploaded successfully',
      );
    },
    onError: () => {
      toast.error(
        t('keyMessage_assortmentUpdateError') || 'Failed to upload images',
      );
    },
    ...options,
  });
}

// Hook specifically for PCF components that detects webhook data automatically
export function useUploadAssortmentImage(options?: MutationConfig<SmartMutationFnType>) {
  return useUploadImagesSmart(options);
}