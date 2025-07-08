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

// NEW: Get sales order from webhook system
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
  
  // Transform webhook data to SalesOrderData format
  return transformWebhookToSalesOrderData(res.data.data);
}

function transformWebhookToSalesOrderData(webhookData: any): SalesOrderData {
  return {
    salesOrder: {
      id: webhookData.salesOrder.id,
      orderNumber: webhookData.salesOrder.id,
      customer: webhookData.salesOrder.customer,
      customerPO: webhookData.salesOrder.customer_po,
      status: webhookData.status || 'active',
      totalAssortments: webhookData.assortments?.length || 0,
      totalImages: webhookData.metadata?.totalImages || 0,
      createdAt: webhookData.receivedAt,
      updatedAt: webhookData.processedAt || webhookData.receivedAt,
    },
    assortments: webhookData.assortments?.map((assortment: any) => ({
      _id: assortment._id?.toString() || assortment.itemNo,
      itemNo: assortment.itemNo,
      customerItemNo: assortment.customerItemNo,
      name: assortment.name,
      status: 'pending' as const, // Fix: Add 'as const' for proper typing
      hasUserModifications: false, // Fix: Add missing property
      uploadedImageCount: 0, // Fix: Add missing property
      webhookImageCount: countAssortmentImages(assortment), // Fix: Use correct property name
      dimensions: {
        length_cm: assortment.length_cm || 0,
        width_cm: assortment.width_cm || 0,
        height_cm: assortment.height_cm || 0,
      },
    })) || [],
    metadata: {
      source: 'webhook' as const, // Fix: Add 'as const' for proper typing
      totalImages: webhookData.metadata?.totalImages || 0,
      lastUpdated: new Date(),
    },
  };
}

function countAssortmentImages(assortment: any): number {
  const pcfImages = assortment.pcfImages;
  if (!pcfImages) return 0;

  const itemPackCount = pcfImages.itemPackImages?.reduce(
    (acc: number, pack: any[]) => acc + pack.length, 0
  ) || 0;
  
  const otherImagesCount = (pcfImages.itemBarcodeImages?.length || 0) +
                           (pcfImages.displayImages?.length || 0) +
                           (pcfImages.innerCartonImages?.length || 0) +
                           (pcfImages.masterCartonImages?.length || 0);

  return itemPackCount + otherImagesCount;
}

type QueryFnType = typeof getSalesOrder;
type WebhookQueryFnType = typeof getWebhookSalesOrder;
type ParamType = Parameters<typeof getSalesOrder>[0];

export const getSalesOrderQuery = (salesOrderId: ParamType) => ({
  queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'sales-order', salesOrderId],
  queryFn: () => getSalesOrder(salesOrderId),
});

export const getWebhookSalesOrderQuery = (salesOrderId: ParamType) => ({
  queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-sales-order', salesOrderId],
  queryFn: () => getWebhookSalesOrder(salesOrderId),
});

// Updated hook to use traditional API
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

// NEW: Hook to use webhook API
export function useGetWebhookSalesOrder(
  salesOrderId: string,
  options?: QueryConfig<WebhookQueryFnType>,
) {
  return useQuery({
    ...getWebhookSalesOrderQuery(salesOrderId),
    enabled: !!salesOrderId && salesOrderId.startsWith('SOP'),
    ...options,
  });
}

// NEW: Smart hook that tries webhook first, falls back to traditional
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