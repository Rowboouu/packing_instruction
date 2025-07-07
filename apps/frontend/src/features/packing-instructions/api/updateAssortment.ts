// @/features/packing-instructions/api/updateAssortment.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import * as z from 'zod';
import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { toast } from 'sonner';
import { AssortmentData, UpdateAssortmentDTO } from '../types';

export const updateAssortmentSchema = z.object({
  _id: z.string(),
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
  }),
});

export type UpdateAssortmentFormDTO = z.infer<typeof updateAssortmentSchema>;

export async function updateAssortment(
  data: UpdateAssortmentDTO,
): Promise<AssortmentData> {
  const res = await api.patch<AssortmentData>(
    `/packing-instruction/assortment/${data._id}`,
    data,
  );
  return res.data;
}

interface MutationContext {
  previousData: AssortmentData | undefined;
}

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

      toast.success('Assortment updated successfully');

      // Call custom onSuccess if provided
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(
          [QUERY_KEYS.PACKING_INSTRUCTION, 'assortment', variables._id],
          context.previousData,
        );
      }

      toast.error('Failed to update assortment');

      // Call custom onError if provided
      options?.onError?.(error, variables, context);
    },
  });
}
