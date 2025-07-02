import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { QueryConfig } from '@/lib/react-query';
import { SalesOrder } from '..';

export async function getSalesOrder(salesOrderId: string) {
  const res = await api.get<SalesOrder>(`/zulu-sales-orders/${salesOrderId}`);
  return res.data;
}

type ParamFnType = Parameters<typeof getSalesOrder>[0];
type QueryFnType = typeof getSalesOrder;

export const getSalesOrderQuery = (param: ParamFnType) => ({
  queryKey: [QUERY_KEYS.SALES_ORDERS, param],
  queryFn: () => getSalesOrder(param),
});

export function useGetSalesOrder(
  param: ParamFnType,
  options?: QueryConfig<QueryFnType>,
) {
  return useQuery({
    ...options,
    ...getSalesOrderQuery(param),
  });
}
