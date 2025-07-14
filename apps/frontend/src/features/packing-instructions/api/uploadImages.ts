// @/features/packing-instructions/api/uploadImages.ts
// Updated to handle both traditional and webhook-sourced assortments with CORRECT endpoints

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';
import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';
import { QUERY_KEYS } from '@/constant/query-key';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  BatchDeleteImagesDTO, // CHANGED: Import the new DTO
  AssortmentData,
  UploadImagesDTO,
} from '../types';

export const uploadImagesSchema = z.object({
  _id: z.string(),
  componentNo: z.string().optional(),
  isWebhookData: z.boolean().optional(),
  itemPackImages: z.array(z.instanceof(File)).optional(),
  itemBarcodeImages: z.array(z.instanceof(File)).optional(),
  displayImages: z.array(z.instanceof(File)).optional(),
  innerCartonImages: z.array(z.instanceof(File)).optional(),
  masterCartonImages: z.array(z.instanceof(File)).optional(),
  innerCartonShippingMarks: z.array(z.instanceof(File)).optional(),
  masterCartonMainShippingMarks: z.array(z.instanceof(File)).optional(),
  masterCartonSideShippingMarks: z.array(z.instanceof(File)).optional(),
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

  // FIXED: Use correct traditional endpoint
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

// FIXED: Webhook-specific image upload with correct field names
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

  // FIXED: Send all files under 'files' field name but track their categories
  let fileIndex = 0;
  const fileMapping: Record<string, string> = {}; // Map file index to category
  
  const imageFields = [
    'itemPackImages',
    'itemBarcodeImages', 
    'displayImages',
    'innerCartonImages',
    'masterCartonImages',
    'innerCartonShippingMarks',
    'masterCartonMainShippingMarks',
    'masterCartonSideShippingMarks',
  ] as const;

  imageFields.forEach((field) => {
    const files = data[field];
    if (files && Array.isArray(files)) {
      files.forEach((file) => {
        // Send file under 'files' field name (matching backend FilesInterceptor)
        formData.append('files', file);
        // Track which category this file belongs to
        fileMapping[fileIndex] = field;
        fileIndex++;
      });
    }
  });

  // Send the file mapping so backend knows which files belong to which category
  formData.append('fileMapping', JSON.stringify(fileMapping));

  // Add image labels as JSON
  if (data.imageLabels) {
    formData.append('imageLabels', JSON.stringify(data.imageLabels));
  }

  // Debug: Log what we're sending
  console.log('📤 Sending FormData fields:');
  console.log('📋 File mapping:', fileMapping);
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }

  // Use correct webhook upload endpoint
  const res = await api.patch<AssortmentData>(
    `/webhook/assortment/${data._id}/images`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return res.data;
}

// Smart upload function - WEBHOOK ONLY
export async function uploadImagesSmart(
  data: UploadImagesDTO,
): Promise<AssortmentData> {
  console.log('🔄 Smart upload called with:', {
    _id: data._id,
    isWebhookData: data.isWebhookData,
    hasFiles: Object.keys(data).some(key => 
      key.includes('Images') && Array.isArray(data[key as keyof UploadImagesDTO]) && 
      (data[key as keyof UploadImagesDTO] as File[])?.length > 0
    )
  });

  // Always use webhook endpoint (as per your architecture)
  console.log('📤 Using webhook upload endpoint');
  return uploadWebhookImages(data);
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
    onError: (error) => {
      console.error('❌ Traditional upload failed:', error);
      toast.error(
        t('keyMessage_assortmentUpdateError') || 'Failed to upload images',
      );
    },
    ...options,
  });
}

// Webhook image upload hook
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
    onError: (error) => {
      console.error('❌ Webhook upload failed:', error);
      toast.error(
        t('keyMessage_assortmentUpdateError') || 'Failed to upload images',
      );
    },
    ...options,
  });
}

// Smart upload hook that automatically chooses the right endpoint
export function useUploadImagesSmart(options?: MutationConfig<SmartMutationFnType>) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: uploadImagesSmart,
    onSuccess: (data, variables) => {
      console.log('✅ Upload successful:', { _id: variables._id, isWebhookData: variables.isWebhookData });
      
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
    onError: (error: any) => {
      console.error('❌ Smart upload failed:', error);
      
      // More detailed error handling
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      
      if (status === 404) {
        toast.error('API endpoint not found. Please check your backend configuration.');
      } else if (status === 400) {
        toast.error(`Bad request: ${message}`);
      } else {
        toast.error(
          t('keyMessage_assortmentUpdateError') || 'Failed to upload images',
        );
      }
    },
    ...options,
  });
}

export function useUploadAssortmentImage(options?: MutationConfig<SmartMutationFnType>) {
  return useUploadImagesSmart(options);
}

export async function batchDeleteImages(
  payload: BatchDeleteImagesDTO
): Promise<any> { // Define a proper response type if needed
  const { assortmentId, imageIds } = payload;
  console.log(`API: Sending batch delete for ${imageIds.length} images.`);
  const res = await api.delete(
    `/webhook/assortment/${assortmentId}/images/batch`,
    {
      data: { imageIds }, // Send imageIds in the request body
    }
  );
  return res.data;
}

export function useBatchDeleteImages(
  options?: MutationConfig<typeof batchDeleteImages>
) {
  return useMutation({
    mutationFn: batchDeleteImages,
    ...options,
  });
}