import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios-client';
import { QUERY_KEYS } from '@/constant/query-key';

export interface SalesOrderData {
  salesOrder: {
    id: string;
    orderNumber: string;
    customer: string;
    status: string;
  };
  assortments: Array<{
    assortmentNumber: string;
    itemNo: string;
    name: string;
    status: 'todo' | 'ongoing' | 'completed' | 'approved';
    hasImages: boolean;
    lastModified?: Date;
  }>;
}

export async function getSalesOrder(salesOrderId: string) {
  const res = await api.get<SalesOrderData>(
    `/packing-instruction/sales-order/${salesOrderId}`,
  );
  return res.data;
}

export function useGetSalesOrder(salesOrderId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'sales-order', salesOrderId],
    queryFn: () => getSalesOrder(salesOrderId),
    enabled: !!salesOrderId && salesOrderId.startsWith('SOP'),
  });
}
