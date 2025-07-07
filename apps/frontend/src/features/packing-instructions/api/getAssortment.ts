// @/features/packing-instructions/api/getAssortment.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios-client';
import { QUERY_KEYS } from '@/constant/query-key';
import { QueryConfig } from '@/lib/react-query';
import { AssortmentData } from '../types';

export async function getAssortment(_id: string): Promise<AssortmentData> {
  const res = await api.get<AssortmentData>(
    `/packing-instruction/assortment/${_id}`,
  );
  return res.data;
}

type QueryFnType = typeof getAssortment;
type ParamType = Parameters<typeof getAssortment>[0];

export const getAssortmentQuery = (_id: ParamType) => ({
  queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'assortment', _id],
  queryFn: () => getAssortment(_id),
});

export function useGetAssortment(
  _id: string,
  options?: QueryConfig<QueryFnType>,
) {
  return useQuery({
    ...getAssortmentQuery(_id),
    enabled: !!_id && _id.startsWith('A'),
    ...options,
  });
}
