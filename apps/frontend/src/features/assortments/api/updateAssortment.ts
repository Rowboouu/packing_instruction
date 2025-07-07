// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import * as z from 'zod';

// import { QUERY_KEYS } from '@/constant/query-key';
// import { api } from '@/lib/axios-client';
// import { MutationConfig } from '@/lib/react-query';
// import { useTranslation } from 'react-i18next';
// import { toast } from 'sonner';
// import { AssortmentPCF } from '..';

// export const editAssormentSchema = z.object({
//   _id: z.string(),
//   status: z.string().optional(),
//   productInCarton: z.coerce.number().optional(),
//   productPerUnit: z.coerce.number().optional(),
//   masterCUFT: z.coerce.number().optional(),
//   masterGrossWeight: z.coerce.number().optional(),
//   unit: z.string().optional(),
//   cubicUnit: z.string().optional(),
//   wtUnit: z.string().optional(),
// });

// export type EditAssortmentDTO = z.infer<typeof editAssormentSchema>;

// export async function editAssortment(data: EditAssortmentDTO) {
//   return api.post<AssortmentPCF>(`/zulu-assortments/${data._id}`, data, {});
// }

// type MutationFnType = typeof editAssortment;

// export function useEditAssortment(options?: MutationConfig<MutationFnType>) {
//   const { t } = useTranslation();
//   const queryClient = useQueryClient();
//   return useMutation({
//     ...options,
//     onMutate: async (variable: EditAssortmentDTO) => {
//       const queryKey = [QUERY_KEYS.ASSORTMENTS, variable._id];
//       await queryClient.cancelQueries({
//         queryKey,
//       });
//       const previousData = queryClient.getQueryData(queryKey);
//       queryClient.setQueryData<AssortmentPCF>(
//         queryKey,
//         (prev) =>
//           ({
//             ...prev,
//             ...variable,
//           }) as AssortmentPCF,
//       );

//       return { previousData };
//     },
//     onSuccess: (res) => {
//       if (res) {
//         queryClient.setQueryData<AssortmentPCF>(
//           [QUERY_KEYS.ASSORTMENTS, res.data._id],
//           (prev) => ({
//             ...prev,
//             ...res.data,
//             pcfImages: prev?.pcfImages || res.data.pcfImages,
//           }),
//         );
//       }
//       toast.success(t('keyMessage_assortmentUpdatedSuccess'));
//     },
//     onError: (_err, variable, context) => {
//       queryClient.setQueryData(
//         [QUERY_KEYS.ASSORTMENTS, variable._id],
//         context?.previousData,
//       );
//     },
//     mutationFn: editAssortment,
//   });
// }

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';
import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';
import { AssortmentData } from './getAssortment';

export const updateAssortmentSchema = z.object({
  _id: z.string(),
  // Keep your existing schema but update field names if needed
  status: z.string().optional(),
  productInCarton: z.coerce.number().optional(),
  productPerUnit: z.coerce.number().optional(),
  masterCUFT: z.coerce.number().optional(),
  masterGrossWeight: z.coerce.number().optional(),
  unit: z.string().optional(),
  cubicUnit: z.string().optional(),
  wtUnit: z.string().optional(),
  // Add new PCF-specific fields
  imageLabels: z.record(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
});

export type UpdateAssortmentDTO = z.infer<typeof updateAssortmentSchema>;

export async function updateAssortment(data: UpdateAssortmentDTO) {
  return api.patch<AssortmentData>(
    `/packing-instruction/assortment/${data._id}`,
    data,
  );
}

export function useUpdateAssortment(
  options?: MutationConfig<typeof updateAssortment>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateAssortment,
    onSuccess: (res, variables) => {
      // Update specific assortment cache
      queryClient.setQueryData(
        [QUERY_KEYS.PACKING_INSTRUCTION, 'assortment', variables._id],
        res.data,
      );

      // Invalidate sales order list to show updated status
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'sales-order'],
      });
    },
    ...options,
  });
}
