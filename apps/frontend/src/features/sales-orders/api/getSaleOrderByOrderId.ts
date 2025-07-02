import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { QueryConfig } from '@/lib/react-query';
import { SalesOrder } from '..';

export async function getSalesOrderByOrderId(salesOrderId: number) {
  const res = await api.get<SalesOrder>(
    `/zulu-sales-orders/order-id/${salesOrderId}`,
  );
  return res.data;
}

type ParamFnType = Parameters<typeof getSalesOrderByOrderId>[0];
type QueryFnType = typeof getSalesOrderByOrderId;

export const getSalesOrderByOrderIdQuery = (param: ParamFnType) => ({
  queryKey: [QUERY_KEYS.SALES_ORDERS, 'order-id', param],
  queryFn: () => getSalesOrderByOrderId(param),
});

export function useGetSalesOrderOrderId(
  param: ParamFnType,
  options?: QueryConfig<QueryFnType>,
) {
  return useQuery({
    ...options,
    ...getSalesOrderByOrderIdQuery(param),
  });
}
