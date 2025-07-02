import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { QueryConfig } from '@/lib/react-query';
import { Customer } from '..';

export async function getCustomer(id: number) {
  const res = await api.get<Customer>(`/zulu-customers/${id}`);

  return res.data;
}

type ParamFnType = Parameters<typeof getCustomer>[0];
type QueryFnType = typeof getCustomer;

export const getCustomerrQuery = (param: ParamFnType) => ({
  queryKey: [QUERY_KEYS.SALES_ORDERS, param],
  queryFn: () => getCustomer(param),
});

export function useGetCustomer(
  param: ParamFnType,
  options?: QueryConfig<QueryFnType>,
) {
  return useQuery({
    ...options,
    ...getCustomerrQuery(param),
  });
}
