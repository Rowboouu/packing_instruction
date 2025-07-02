import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { QueryConfig } from '@/lib/react-query';
import { AssortmentPCF } from '..';

export async function getAssortment(userId: string) {
  const res = await api.get<AssortmentPCF>(`/zulu-assortments/${userId}`);
  return res.data;
}

type ParamFnType = Parameters<typeof getAssortment>[0];
type QueryFnType = typeof getAssortment;

export const getAssortmentQuery = (param: ParamFnType) => ({
  queryKey: [QUERY_KEYS.ASSORTMENTS, param],
  queryFn: () => getAssortment(param),
});

export function useGetAssortment(
  param: ParamFnType,
  options?: QueryConfig<QueryFnType>,
) {
  return useQuery({
    ...options,
    ...getAssortmentQuery(param),
  });
}
