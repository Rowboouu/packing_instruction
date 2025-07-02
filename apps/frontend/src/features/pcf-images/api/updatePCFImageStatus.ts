import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

export const updatePCFImageStatusSchema = z.object({
  _id: z.string(),
  isApproved: z.boolean(),
});

export type UpdatePCFImageStatusDTO = z.infer<
  typeof updatePCFImageStatusSchema
>;

export function updatePCFImageStatus({
  _id,
  ...data
}: UpdatePCFImageStatusDTO) {
  return api.patch(`/pcf-images/${_id}`, data);
}

type MutationFnType = typeof updatePCFImageStatus;

export function useUpdatePCFImageStatus(
  options?: MutationConfig<MutationFnType>,
) {
  return useMutation({
    ...options,
    mutationFn: updatePCFImageStatus,
  });
}
