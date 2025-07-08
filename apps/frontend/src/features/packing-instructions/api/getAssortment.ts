// @/features/packing-instructions/api/getAssortment.ts
// COMPLETE REPLACEMENT - COPY THIS ENTIRE FILE

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios-client';
import { QUERY_KEYS } from '@/constant/query-key';
import { QueryConfig } from '@/lib/react-query';
import { AssortmentData, WebhookAssortment, WebhookSalesOrder, WebhookPcfImages, AssortmentStatus } from '../types';
import { AssortmentPCF } from '@/features/assortments';

// Helper function to calculate total image count
function calculateImageCount(pcfImages: any): number {
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

// Traditional API
export async function getAssortment(_id: string): Promise<AssortmentData> {
  const res = await api.get<any>(`/packing-instruction/assortment/${_id}`);
  
  // Transform the raw response to AssortmentData
  return transformRawDataToAssortmentData(res.data, 'traditional');
}

// SIMPLIFIED Webhook API - No Complex Transformation
export async function getWebhookAssortment(_id: string): Promise<AssortmentData> {
  console.log(`🚀 CALLING WEBHOOK API: /webhook/assortment/${_id}`);
  
  const res = await api.get<{
    success: boolean;
    data?: any; // Accept any structure
    source?: 'individual' | 'sales_order';
    message?: string;
    assortmentId: string;
  }>(`/webhook/assortment/${_id}`);

  console.log('--- SIMPLE API DEBUG ---');
  console.log('1. Full API Response:', res);
  console.log('2. Response Status:', res.status);
  console.log('3. Response Data:', res.data);
  console.log('4. API Success:', res.data.success);
  console.log('5. API Source:', res.data.source);
  console.log('6. API Data Field:', res.data.data);

  if (!res.data.success || !res.data.data) {
    console.log('❌ API FAILED:', res.data.message);
    throw new Error(res.data.message || `Webhook assortment ${_id} not found`);
  }

  const rawData = res.data.data;
  
  // Let's see what fields are actually available
  console.log('7. Raw Data Type:', typeof rawData);
  console.log('8. Raw Data Keys:', Object.keys(rawData));
  console.log('9. Raw Data Values Check:');
  console.log('   - Direct itemNo:', JSON.stringify(rawData.itemNo));
  console.log('   - Direct name:', JSON.stringify(rawData.name));
  console.log('   - Direct _id:', JSON.stringify(rawData._id));
  
  // Check for Mongoose document structure
  console.log('10. Mongoose Structure Check:');
  console.log('   - rawData._doc:', rawData._doc);
  console.log('   - rawData.assortmentData:', rawData.assortmentData);
  console.log('   - rawData.toObject:', typeof rawData.toObject);
  
  // Extract the actual data from Mongoose document
  let actualData = rawData;
  
  // Try different ways to get the actual data
  if (rawData._doc) {
    console.log('11. Using _doc for data');
    actualData = rawData._doc;
  } else if (rawData.assortmentData) {
    console.log('11. Using assortmentData for data');
    actualData = rawData.assortmentData;
  } else if (typeof rawData.toObject === 'function') {
    console.log('11. Using toObject() for data');
    actualData = rawData.toObject();
  }
  
  console.log('12. Final actualData:');
  console.log('   - actualData.itemNo:', JSON.stringify(actualData.itemNo));
  console.log('   - actualData.name:', JSON.stringify(actualData.name));
  console.log('   - actualData._id:', JSON.stringify(actualData._id));
  console.log('   - actualData.customerItemNo:', JSON.stringify(actualData.customerItemNo));
  console.log('   - actualData.orderId:', JSON.stringify(actualData.orderId));

  // Create simple structure directly from actual data
  const result: AssortmentData = {
    baseAssortment: {
      _id: String(actualData._id || actualData.itemNo || ''),
      itemNo: String(actualData.itemNo || ''),
      customerItemNo: String(actualData.customerItemNo || ''),
      name: String(actualData.name || ''),
      orderId: Number(actualData.orderId || 0),
      productId: Number(actualData.productId || 0),
      status: (actualData.status as AssortmentStatus) || 'pending',
      length_cm: Number(actualData.length_cm || 0),
      width_cm: Number(actualData.width_cm || 0),
      height_cm: Number(actualData.height_cm || 0),
      master_carton_length_cm: Number(actualData.master_carton_length_cm || 0),
      master_carton_width_cm: Number(actualData.master_carton_width_cm || 0),
      master_carton_height_cm: Number(actualData.master_carton_height_cm || 0),
      inner_carton_length_cm: Number(actualData.inner_carton_length_cm || 0),
      inner_carton_width_cm: Number(actualData.inner_carton_width_cm || 0),
      inner_carton_height_cm: Number(actualData.inner_carton_height_cm || 0),
      webhookImages: actualData.pcfImages || {
        itemPackImages: [],
        itemBarcodeImages: [],
        displayImages: [],
        innerCartonImages: [],
        masterCartonImages: [],
      },
      sourceOrderName: actualData.orderName || `INDIVIDUAL_${actualData.itemNo}`,
      salesOrder: actualData.salesOrder,
    },
    userModifications: {
      uploadedImages: {},
      imageLabels: {},
      customFields: {},
      formData: {},
    },
    mergedData: {
      assortment: {
        _id: String(actualData._id || actualData.itemNo || ''),
        orderItemId: Number(actualData._id || 0),
        customerItemNo: actualData.customerItemNo || null,
        itemNo: String(actualData.itemNo || ''),
        name: String(actualData.name || ''),
        orderId: Number(actualData.orderId || 0),
        productId: Number(actualData.productId || 0),
        createdAt: actualData.createdAt || new Date().toISOString(),
        updatedAt: actualData.updatedAt || new Date().toISOString(),
        status: (actualData.status as AssortmentStatus) || 'pending',
        uploadStatus: 'pending',
        length_cm: Number(actualData.length_cm || 0),
        width_cm: Number(actualData.width_cm || 0),
        height_cm: Number(actualData.height_cm || 0),
        master_carton_length_cm: Number(actualData.master_carton_length_cm || 0),
        master_carton_width_cm: Number(actualData.master_carton_width_cm || 0),
        master_carton_height_cm: Number(actualData.master_carton_height_cm || 0),
        inner_carton_length_cm: Number(actualData.inner_carton_length_cm || 0),
        inner_carton_width_cm: Number(actualData.inner_carton_width_cm || 0),
        inner_carton_height_cm: Number(actualData.inner_carton_height_cm || 0),
        masterCUFT: actualData.masterCUFT,
        masterGrossWeight: actualData.masterGrossWeight,
        productInCarton: actualData.productInCarton,
        productPerUnit: actualData.productPerUnit,
        pcfImages: actualData.pcfImages || {
          itemPackImages: [],
          itemBarcodeImages: [],
          displayImages: [],
          innerCartonImages: [],
          masterCartonImages: [],
        },
      },
      allImages: {
        itemPackImages: [],
        itemBarcodeImages: [],
        displayImages: [],
        innerCartonImages: [],
        masterCartonImages: [],
      },
      webhookImages: actualData.pcfImages || {
        itemPackImages: [],
        itemBarcodeImages: [],
        displayImages: [],
        innerCartonImages: [],
        masterCartonImages: [],
      },
      imageLabels: {},
      combinedImageCount: calculateImageCount(actualData.pcfImages),
    },
    metadata: {
      source: 'webhook',
      lastModified: new Date(actualData.updatedAt || Date.now()),
      version: actualData.version || 1,
      syncedAt: new Date(),
      isWebhookData: true,
      dataSource: 'api',
    },
  };

  console.log('13. CREATED RESULT:');
  console.log('    - baseAssortment.itemNo:', result.baseAssortment.itemNo);
  console.log('    - baseAssortment.name:', result.baseAssortment.name);
  console.log('    - mergedData.assortment.itemNo:', result.mergedData.assortment.itemNo);
  console.log('    - mergedData.assortment.name:', result.mergedData.assortment.name);
  console.log('--- END SIMPLE API DEBUG ---');

  return result;
}

// Keep the old transformation function for traditional API
function transformRawDataToAssortmentData(rawData: any, source: 'webhook' | 'traditional'): AssortmentData {
  console.log('--- OLD TRANSFORMATION CALLED ---', source);
  
  // Create base assortment structure
  const baseAssortment = {
    _id: rawData._id?.toString() || rawData.itemNo || '',
    itemNo: rawData.itemNo || '',
    customerItemNo: rawData.customerItemNo || '',
    name: rawData.name || '',
    orderId: rawData.orderId || 0,
    productId: rawData.productId || 0,
    status: (rawData.status as AssortmentStatus) || 'pending',
    length_cm: rawData.length_cm || 0,
    width_cm: rawData.width_cm || 0,
    height_cm: rawData.height_cm || 0,
    master_carton_length_cm: rawData.master_carton_length_cm || 0,
    master_carton_width_cm: rawData.master_carton_width_cm || 0,
    master_carton_height_cm: rawData.master_carton_height_cm || 0,
    inner_carton_length_cm: rawData.inner_carton_length_cm || 0,
    inner_carton_width_cm: rawData.inner_carton_width_cm || 0,
    inner_carton_height_cm: rawData.inner_carton_height_cm || 0,
    webhookImages: rawData.pcfImages || {
      itemPackImages: [],
      itemBarcodeImages: [],
      displayImages: [],
      innerCartonImages: [],
      masterCartonImages: [],
    },
    sourceOrderName: rawData.orderName,
    salesOrder: rawData.salesOrder,
  };

  // Create AssortmentPCF structure
  const assortmentPCF: AssortmentPCF = {
    _id: rawData._id?.toString() || rawData.itemNo || '',
    orderItemId: rawData._id || 0,
    customerItemNo: rawData.customerItemNo || null,
    itemNo: rawData.itemNo || '',
    name: rawData.name || '',
    orderId: rawData.orderId || 0,
    productId: rawData.productId || 0,
    createdAt: rawData.createdAt || new Date().toISOString(),
    updatedAt: rawData.updatedAt || new Date().toISOString(),
    status: (rawData.status as AssortmentStatus) || 'pending',
    uploadStatus: 'pending',
    length_cm: rawData.length_cm || 0,
    width_cm: rawData.width_cm || 0,
    height_cm: rawData.height_cm || 0,
    master_carton_length_cm: rawData.master_carton_length_cm || 0,
    master_carton_width_cm: rawData.master_carton_width_cm || 0,
    master_carton_height_cm: rawData.master_carton_height_cm || 0,
    inner_carton_length_cm: rawData.inner_carton_length_cm || 0,
    inner_carton_width_cm: rawData.inner_carton_width_cm || 0,
    inner_carton_height_cm: rawData.inner_carton_height_cm || 0,
    masterCUFT: rawData.masterCUFT,
    masterGrossWeight: rawData.masterGrossWeight,
    productInCarton: rawData.productInCarton,
    productPerUnit: rawData.productPerUnit,
    pcfImages: rawData.pcfImages || {
      itemPackImages: [],
      itemBarcodeImages: [],
      displayImages: [],
      innerCartonImages: [],
      masterCartonImages: [],
    },
  };

  const combinedImageCount = calculateImageCount(rawData.pcfImages || {});

  const result: AssortmentData = {
    baseAssortment,
    userModifications: {
      uploadedImages: {},
      imageLabels: {},
      customFields: {},
      formData: {},
    },
    mergedData: {
      assortment: assortmentPCF,
      allImages: {
        itemPackImages: [],
        itemBarcodeImages: [],
        displayImages: [],
        innerCartonImages: [],
        masterCartonImages: [],
      },
      webhookImages: rawData.pcfImages || {
        itemPackImages: [],
        itemBarcodeImages: [],
        displayImages: [],
        innerCartonImages: [],
        masterCartonImages: [],
      },
      imageLabels: {},
      combinedImageCount,
    },
    metadata: {
      source: source,
      lastModified: rawData.updatedAt ? new Date(rawData.updatedAt) : new Date(),
      version: rawData.version || 1,
      syncedAt: rawData.syncedAt ? new Date(rawData.syncedAt) : new Date(),
      isWebhookData: source === 'webhook',
      dataSource: 'api',
    },
  };

  return result;
}

type QueryFnType = typeof getAssortment;
type WebhookQueryFnType = typeof getWebhookAssortment;
type ParamType = Parameters<typeof getAssortment>[0];

export const getAssortmentQuery = (_id: ParamType) => ({
  queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'assortment', _id],
  queryFn: () => getAssortment(_id),
});

export const getWebhookAssortmentQuery = (_id: ParamType) => ({
  queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-assortment', _id],
  queryFn: () => getWebhookAssortment(_id),
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

export function useGetWebhookAssortment(
  _id: string,
  options?: QueryConfig<WebhookQueryFnType>,
) {
  return useQuery({
    ...getWebhookAssortmentQuery(_id),
    enabled: !!_id && _id.startsWith('A'),
    ...options,
  });
}

export function useGetAssortmentSmart(
  _id: string,
  preferWebhook: boolean = true,
  options?: QueryConfig<any>,
) {
  const webhookQuery = useGetWebhookAssortment(_id, {
    enabled: !!_id && _id.startsWith('A') && preferWebhook,
    retry: 1,
    ...options,
  });

  const traditionalQuery = useGetAssortment(_id, {
    enabled: !!_id && _id.startsWith('A') && (!preferWebhook || webhookQuery.isError),
    ...options,
  });

  if (preferWebhook && webhookQuery.isSuccess && webhookQuery.data) {
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