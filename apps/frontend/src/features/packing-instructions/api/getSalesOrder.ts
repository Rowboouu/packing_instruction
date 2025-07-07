// @/features/packing-instructions/api/getSalesOrder.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios-client';
import { QUERY_KEYS } from '@/constant/query-key';
import { QueryConfig } from '@/lib/react-query';
import { SalesOrderData } from '../types';

export async function getSalesOrder(
  salesOrderId: string,
): Promise<SalesOrderData> {
  const res = await api.get<SalesOrderData>(
    `/packing-instruction/sales-order/${salesOrderId}`,
  );
  return res.data;
}

type QueryFnType = typeof getSalesOrder;
type ParamType = Parameters<typeof getSalesOrder>[0];

export const getSalesOrderQuery = (salesOrderId: ParamType) => ({
  queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'sales-order', salesOrderId],
  queryFn: () => getSalesOrder(salesOrderId),
});

export function useGetSalesOrder(
  salesOrderId: string,
  options?: QueryConfig<QueryFnType>,
) {
  return useQuery({
    ...getSalesOrderQuery(salesOrderId),
    enabled: !!salesOrderId && salesOrderId.startsWith('SOP'),
    ...options,
  });
}
