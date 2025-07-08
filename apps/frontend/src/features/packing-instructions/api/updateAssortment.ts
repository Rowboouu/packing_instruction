// @/features/packing-instructions/api/updateAssortment.ts
// Updated to handle both traditional and webhook-sourced assortments

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import * as z from 'zod';
import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { toast } from 'sonner';
import { AssortmentData, UpdateAssortmentDTO } from '../types';

export const updateAssortmentSchema = z.object({
  _id: z.string(),
  isWebhookData: z.boolean().optional(),
  userModifications: z.object({
    formData: z
      .object({
        productInCarton: z.coerce.number().optional(),
        productPerUnit: z.coerce.number().optional(),
        masterCUFT: z.coerce.number().optional(),
        masterGrossWeight: z.coerce.number().optional(),
        unit: z.string().optional(),
        cubicUnit: z.string().optional(),
        wtUnit: z.string().optional(),
      })
      .optional(),
    imageLabels: z.record(z.string()).optional(),
    customFields: z.record(z.any()).optional(),
    uploadedImages: z.record(z.any()).optional(),
  }),
});

export type UpdateAssortmentFormDTO = z.infer<typeof updateAssortmentSchema>;

// Traditional API update
export async function updateAssortment(
  data: UpdateAssortmentDTO,
): Promise<AssortmentData> {
  const res = await api.patch<AssortmentData>(
    `/packing-instruction/assortment/${data._id}`,
    data,
  );
  return res.data;
}

// NEW: Webhook-based assortment update
export async function updateWebhookAssortment(
  data: UpdateAssortmentDTO,
): Promise<AssortmentData> {
  // For webhook assortments, we might need to update differently
  // This could save to a separate user modifications table/collection
  const res = await api.patch<AssortmentData>(
    `/packing-instruction/webhook-assortment/${data._id}`,
    {
      ...data,
      isWebhookData: true,
    },
  );
  return res.data;
}

// Smart update function that chooses the right endpoint
export async function updateAssortmentSmart(
  data: UpdateAssortmentDTO,
): Promise<AssortmentData> {
  if (data.isWebhookData) {
    return updateWebhookAssortment(data);
  }
  return updateAssortment(data);
}

interface MutationContext {
  previousData: AssortmentData | undefined;
}

// Traditional update hook
export function useUpdateAssortment(options?: {
  onSuccess?: (
    data: AssortmentData,
    variables: UpdateAssortmentDTO,
    context: MutationContext | undefined,
  ) => void;
  onError?: (
    error: AxiosError,
    variables: UpdateAssortmentDTO,
    context: MutationContext | undefined,
  ) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    AssortmentData,
    AxiosError,
    UpdateAssortmentDTO,
    MutationContext
  >({
    mutationFn: updateAssortment,
    onMutate: async (
      variables: UpdateAssortmentDTO,
    ): Promise<MutationContext> => {
      // Cancel outgoing refetches
      const queryKey = [
        QUERY_KEYS.PACKING_INSTRUCTION,
        'assortment',
        variables._id,
      ];
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<AssortmentData>(queryKey);

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<AssortmentData>(queryKey, (prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            userModifications: {
              ...prev.userModifications,
              ...variables.userModifications,
            },
            metadata: {
              ...prev.metadata,
              lastModified: new Date(),
              version: (prev.metadata.version || 0) + 1,
            },
          };
        });
      }

      return { previousData };
    },
    onSuccess: (data, variables, context) => {
      // Update the specific assortment cache with server response
      queryClient.setQueryData(
        [QUERY_KEYS.PACKING_INSTRUCTION, 'assortment', variables._id],
        data,
      );

      // Invalidate sales order list to show updated status
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'sales-order'],
      });

      // Also invalidate webhook queries if this was webhook data
      if (variables.isWebhookData) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-assortment'],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-sales-order'],
        });
      }

      toast.success('Assortment updated successfully');

      // Call custom onSuccess if provided
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        const queryKey = variables.isWebhookData 
          ? [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-assortment', variables._id]
          : [QUERY_KEYS.PACKING_INSTRUCTION, 'assortment', variables._id];
          
        queryClient.setQueryData(queryKey, context.previousData);
      }

      toast.error('Failed to update assortment');

      // Call custom onError if provided
      options?.onError?.(error, variables, context);
    },
  });
}

// NEW: Webhook assortment update hook
export function useUpdateWebhookAssortment(options?: {
  onSuccess?: (
    data: AssortmentData,
    variables: UpdateAssortmentDTO,
    context: MutationContext | undefined,
  ) => void;
  onError?: (
    error: AxiosError,
    variables: UpdateAssortmentDTO,
    context: MutationContext | undefined,
  ) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    AssortmentData,
    AxiosError,
    UpdateAssortmentDTO,
    MutationContext
  >({
    mutationFn: updateWebhookAssortment,
    onMutate: async (
      variables: UpdateAssortmentDTO,
    ): Promise<MutationContext> => {
      // Cancel outgoing refetches for webhook data
      const webhookQueryKey = [
        QUERY_KEYS.PACKING_INSTRUCTION,
        'webhook-assortment',
        variables._id,
      ];
      await queryClient.cancelQueries({ queryKey: webhookQueryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<AssortmentData>(webhookQueryKey);

      // Optimistically update webhook data
      if (previousData) {
        queryClient.setQueryData<AssortmentData>(webhookQueryKey, (prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            userModifications: {
              ...prev.userModifications,
              ...variables.userModifications,
            },
            metadata: {
              ...prev.metadata,
              lastModified: new Date(),
              version: (prev.metadata.version || 0) + 1,
            },
          };
        });
      }

      return { previousData };
    },
    onSuccess: (data, variables, context) => {
      // Update webhook assortment cache
      queryClient.setQueryData(
        [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-assortment', variables._id],
        data,
      );

      // Invalidate related webhook queries
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-sales-order'],
      });

      toast.success('Assortment updated successfully');

      // Call custom onSuccess if provided
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(
          [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-assortment', variables._id],
          context.previousData,
        );
      }

      toast.error('Failed to update webhook assortment');

      // Call custom onError if provided
      options?.onError?.(error, variables, context);
    },
  });
}

// NEW: Smart update hook that automatically chooses the right mutation
export function useUpdateAssortmentSmart(options?: {
  onSuccess?: (
    data: AssortmentData,
    variables: UpdateAssortmentDTO,
    context: MutationContext | undefined,
  ) => void;
  onError?: (
    error: AxiosError,
    variables: UpdateAssortmentDTO,
    context: MutationContext | undefined,
  ) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    AssortmentData,
    AxiosError,
    UpdateAssortmentDTO,
    MutationContext
  >({
    mutationFn: updateAssortmentSmart,
    onMutate: async (
      variables: UpdateAssortmentDTO,
    ): Promise<MutationContext> => {
      // Determine which query key to use based on data type
      const queryKey = variables.isWebhookData
        ? [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-assortment', variables._id]
        : [QUERY_KEYS.PACKING_INSTRUCTION, 'assortment', variables._id];

      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<AssortmentData>(queryKey);

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<AssortmentData>(queryKey, (prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            userModifications: {
              ...prev.userModifications,
              ...variables.userModifications,
            },
            metadata: {
              ...prev.metadata,
              lastModified: new Date(),
              version: (prev.metadata.version || 0) + 1,
            },
          };
        });
      }

      return { previousData };
    },
    onSuccess: (data, variables, context) => {
      // Update the appropriate cache based on data type
      const queryKey = variables.isWebhookData
        ? [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-assortment', variables._id]
        : [QUERY_KEYS.PACKING_INSTRUCTION, 'assortment', variables._id];

      queryClient.setQueryData(queryKey, data);

      // Invalidate related queries
      if (variables.isWebhookData) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-sales-order'],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'sales-order'],
        });
      }

      toast.success('Assortment updated successfully');

      // Call custom onSuccess if provided
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        const queryKey = variables.isWebhookData
          ? [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-assortment', variables._id]
          : [QUERY_KEYS.PACKING_INSTRUCTION, 'assortment', variables._id];

        queryClient.setQueryData(queryKey, context.previousData);
      }

      toast.error('Failed to update assortment');

      // Call custom onError if provided
      options?.onError?.(error, variables, context);
    },
  });
}