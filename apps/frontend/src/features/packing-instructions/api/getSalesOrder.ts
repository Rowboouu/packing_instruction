// @/features/packing-instructions/api/getSalesOrder.ts
// Updated to use shared transformers

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios-client';
import { QUERY_KEYS } from '@/constant/query-key';
import { QueryConfig } from '@/lib/react-query';
import { SalesOrderData } from '../types';
import { transformWebhookToSalesOrderData } from '../utils/transformers';

// Traditional sales order API
export async function getSalesOrder(
  salesOrderId: string,
): Promise<SalesOrderData> {
  const res = await api.get<SalesOrderData>(
    `/packing-instruction/sales-order/${salesOrderId}`,
  );
  return res.data;
}

// Webhook sales order API with shared transformers
export async function getWebhookSalesOrder(salesOrderId: string): Promise<SalesOrderData> {
  const res = await api.get<{
    success: boolean;
    data?: {
      orderName: string;
      salesOrder: {
        id: string;
        customer: string;
        customer_po?: string;
      };
      assortments: Array<any>;
      status: string;
      receivedAt: string;
      processedAt?: string;
      metadata?: {
        totalImages: number;
        assortmentCount: number;
        source: string;
      };
    };
    message?: string;
    orderName: string;
  }>(`/webhook/data/${salesOrderId}`);
  
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || `Sales order ${salesOrderId} not found`);
  }
  
  // Use shared transformer - this ensures consistent AssortmentData structure
  return transformWebhookToSalesOrderData(res.data.data);
}

type QueryFnType = typeof getSalesOrder;
type WebhookQueryFnType = typeof getWebhookSalesOrder;
type ParamType = Parameters<typeof getSalesOrder>[0];

// Query configurations
export const getSalesOrderQuery = (salesOrderId: ParamType) => ({
  queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'sales-order', salesOrderId],
  queryFn: () => getSalesOrder(salesOrderId),
});

export const getWebhookSalesOrderQuery = (salesOrderId: ParamType) => ({
  queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-sales-order', salesOrderId],
  queryFn: () => getWebhookSalesOrder(salesOrderId),
});

// Traditional sales order hook
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

// Webhook sales order hook
export function useGetWebhookSalesOrder(
  salesOrderId: string,
  options?: QueryConfig<WebhookQueryFnType>,
) {
  return useQuery({
    ...getWebhookSalesOrderQuery(salesOrderId),
    enabled: !!salesOrderId && salesOrderId.startsWith('SOP'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  });
}

// Smart hook that tries webhook first, falls back to traditional
export function useGetSalesOrderSmart(
  salesOrderId: string,
  preferWebhook: boolean = true,
  options?: QueryConfig<QueryFnType | WebhookQueryFnType>,
) {
  const webhookQuery = useGetWebhookSalesOrder(salesOrderId, {
    enabled: !!salesOrderId && salesOrderId.startsWith('SOP') && preferWebhook,
    retry: 1,
    ...options,
  });

  const traditionalQuery = useGetSalesOrder(salesOrderId, {
    enabled: !!salesOrderId && salesOrderId.startsWith('SOP') && (!preferWebhook || webhookQuery.isError),
    ...options,
  });

  if (preferWebhook && !webhookQuery.isError && webhookQuery.data) {
    return {
      ...webhookQuery,
      dataSource: 'webhook' as const,
    };
  }

  return {
    ...traditionalQuery,
    dataSource: 'traditional' as const,
  };
}