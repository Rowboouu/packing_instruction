// import { useQuery } from '@tanstack/react-query';

// import { QUERY_KEYS } from '@/constant/query-key';
// import { api } from '@/lib/axios-client';
// import { QueryConfig } from '@/lib/react-query';
// import { AssortmentPCF } from '..';

// export async function getAssortment(userId: string) {
//   const res = await api.get<AssortmentPCF>(`/zulu-assortments/${userId}`);
//   return res.data;
// }

// type ParamFnType = Parameters<typeof getAssortment>[0];
// type QueryFnType = typeof getAssortment;

// export const getAssortmentQuery = (param: ParamFnType) => ({
//   queryKey: [QUERY_KEYS.ASSORTMENTS, param],
//   queryFn: () => getAssortment(param),
// });

// export function useGetAssortment(
//   param: ParamFnType,
//   options?: QueryConfig<QueryFnType>,
// ) {
//   return useQuery({
//     ...options,
//     ...getAssortmentQuery(param),
//   });
// }

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios-client';
import { QUERY_KEYS } from '@/constant/query-key';
import { AssortmentPCF } from '@/features/assortments';
import { PcfImage } from '@/features/pcf-images';

export interface AssortmentData {
  assortment: AssortmentPCF;
  pcfData: {
    uploadedImages: {
      itemPackImages: PcfImage[];
      itemBarcodeImages: PcfImage[];
      displayImages: PcfImage[];
      innerCartonImages: PcfImage[];
      masterCartonImages: PcfImage[];
    };
    imageLabels: Record<string, string>;
    customFields: Record<string, any>;
  };
  metadata: {
    lastModified: Date;
    version: number;
    syncedAt: Date;
  };
}

export async function getAssortment(assortmentNumber: string) {
  const res = await api.get<AssortmentData>(
    `/packing-instruction/assortment/${assortmentNumber}`,
  );
  return res.data;
}

export function useGetAssortment(assortmentNumber: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'assortment', assortmentNumber],
    queryFn: () => getAssortment(assortmentNumber),
    enabled: !!assortmentNumber && assortmentNumber.startsWith('A'),
  });
}
