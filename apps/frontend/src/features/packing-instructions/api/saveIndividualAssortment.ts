import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';
import { toast } from 'sonner';

export interface SaveIndividualAssortmentDTO {
  assortment: any; // The full assortment object from webhook
  sourceOrderName: string; // The source sales order ID
}

export interface SaveIndividualAssortmentResponse {
  success: boolean;
  message: string;
  assortmentId: string;
  dataId: string;
  sourceOrder: string;
}

export async function saveIndividualAssortment(
  data: SaveIndividualAssortmentDTO,
): Promise<SaveIndividualAssortmentResponse> {
  const res = await api.post<SaveIndividualAssortmentResponse>(
    '/webhook/assortment/save',
    data,
  );
  return res.data;
}

type MutationFnType = typeof saveIndividualAssortment;

export function useSaveIndividualAssortment(
  options?: MutationConfig<MutationFnType> & {
    showToast?: boolean;
  },
) {
  const { showToast = false, ...mutationOptions } = options || {};

  return useMutation({
    mutationFn: saveIndividualAssortment,
    onSuccess: (data, variables) => {
      if (showToast) {
        toast.success(`Saved ${variables.assortment.itemNo} for standalone access`);
      }
    },
    onError: (error) => {
      if (showToast) {
        toast.error('Failed to save assortment for standalone access');
      }
      console.warn('Individual assortment save failed:', error);
    },
    ...mutationOptions,
  });
}