import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';
import { useMutation } from '@tanstack/react-query';

export function deletePCFImage(pcfImageId: string) {
  return api.delete(`/pcf-images/${pcfImageId}`);
}

type MutationFnType = typeof deletePCFImage;

export function useDeletePCFImage(options?: MutationConfig<MutationFnType>) {
  return useMutation({
    ...options,
    mutationFn: deletePCFImage,
  });
}
