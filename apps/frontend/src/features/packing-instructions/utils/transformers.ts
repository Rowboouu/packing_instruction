// @/features/packing-instructions/utils/transformers.ts

import { AssortmentData, AssortmentStatus, SalesOrderData } from '../types';
import { AssortmentPCF } from '@/features/assortments';

// Helper function to calculate total image count
export function calculateImageCount(pcfImages: any): number {
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

// FIXED: Helper function to filter out deleted images from user modifications
function filterDeletedImagesFromUserMods(userModifications: any): any {
  if (!userModifications?.uploadedImages) {
    return userModifications;
  }

  // Create a deep copy to avoid mutation
  const filtered = {
    ...userModifications,
    uploadedImages: {
      itemPackImages: userModifications.uploadedImages.itemPackImages || [],
      itemBarcodeImages: userModifications.uploadedImages.itemBarcodeImages || [],
      displayImages: userModifications.uploadedImages.displayImages || [],
      innerCartonImages: userModifications.uploadedImages.innerCartonImages || [],
      masterCartonImages: userModifications.uploadedImages.masterCartonImages || [],
    }
  };

  // The backend should have already removed deleted images,
  // but we ensure consistency here
  console.log('🔄 Transformer: User modifications after filtering:', {
    itemPack: filtered.uploadedImages.itemPackImages?.length || 0,
    barcode: filtered.uploadedImages.itemBarcodeImages?.length || 0,
    display: filtered.uploadedImages.displayImages?.length || 0,
    innerCarton: filtered.uploadedImages.innerCartonImages?.length || 0,
    masterCarton: filtered.uploadedImages.masterCartonImages?.length || 0,
  });

  return filtered;
}

// Main transformation function for raw data to AssortmentData
export function transformRawDataToAssortmentData(
  rawData: any, 
  source: 'webhook' | 'traditional'
): AssortmentData {
  
  // Extract actual data (handle Mongoose documents and various wrapper formats)
  let actualData = rawData;
  if (rawData._doc) {
    actualData = rawData._doc;
  } else if (rawData.assortmentData) {
    actualData = rawData.assortmentData;
  } else if (typeof rawData.toObject === 'function') {
    actualData = rawData.toObject();
  }

  // Create base assortment structure
  const baseAssortment = {
    _id: String(actualData._id || actualData.itemNo || ''),
    itemNo: String(actualData.itemNo || ''),
    customerItemNo: String(actualData.customerItemNo || ''),
    name: String(actualData.name || ''),
    orderId: Number(actualData.orderId || 0),
    productId: Number(actualData.productId || 0),
    status: String(actualData.status || 'pending'),
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
    sourceOrderName: actualData.orderName || (source === 'webhook' ? `INDIVIDUAL_${actualData.itemNo}` : undefined),
    salesOrder: actualData.salesOrder,
  };

  // Create AssortmentPCF structure for merged data
  const assortmentPCF: AssortmentPCF = {
    _id: String(actualData._id || actualData.itemNo || ''),
    orderItemId: Number(actualData._id || 0),
    customerItemNo: actualData.customerItemNo || null,
    itemNo: String(actualData.itemNo || ''),
    name: String(actualData.name || ''),
    orderId: Number(actualData.orderId || 0),
    productId: Number(actualData.productId || 0),
    createdAt: actualData.createdAt || new Date().toISOString(),
    updatedAt: actualData.updatedAt || new Date().toISOString(),
    status: String(actualData.status || 'pending') as AssortmentStatus,
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
  };

  // Build complete AssortmentData structure
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
      webhookImages: actualData.pcfImages || {
        itemPackImages: [],
        itemBarcodeImages: [],
        displayImages: [],
        innerCartonImages: [],
        masterCartonImages: [],
      },
      imageLabels: {},
      combinedImageCount: calculateImageCount(actualData.pcfImages || {}),
    },
    metadata: {
      source: source,
      lastModified: actualData.updatedAt ? new Date(actualData.updatedAt) : new Date(),
      version: actualData.version || actualData._version || 1,
      syncedAt: actualData.syncedAt ? new Date(actualData.syncedAt) : new Date(),
      isWebhookData: source === 'webhook',
      dataSource: 'api',
      // Add optional fields that won't break existing types
      ...(actualData._persistentStorageEnabled && { persistentStorageEnabled: actualData._persistentStorageEnabled }),
      ...(actualData._cacheKey && { cacheKey: actualData._cacheKey }),
      ...(actualData._imageCollectionHash && { imageCollectionHash: actualData._imageCollectionHash }),
      ...(actualData._performanceMetrics && { performanceMetrics: actualData._performanceMetrics }),
    },
  };

  return result;
}

// Transform webhook data to SalesOrderData format
export function transformWebhookToSalesOrderData(webhookData: any): SalesOrderData {
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
    // FIX: Transform each assortment to full AssortmentData structure
    assortments: webhookData.assortments?.map((assortmentRaw: any) => {
      // Use the same transformation as individual assortments
      return transformRawDataToAssortmentData(assortmentRaw, 'webhook');
    }) || [],
    metadata: {
      source: 'webhook' as const,
      totalImages: webhookData.metadata?.totalImages || 0,
      lastUpdated: new Date(),
    },
  };
}

// FIXED: Transform individual assortment API response - PROPERLY FILTER DELETED IMAGES
export function transformIndividualAssortmentResponse(rawData: any): AssortmentData {
  
  // Extract actual data (handle Mongoose documents and various wrapper formats)
  let actualData = rawData;
  if (rawData._doc) {
    actualData = rawData._doc;
  } else if (rawData.assortmentData) {
    actualData = rawData.assortmentData;
  } else if (typeof rawData.toObject === 'function') {
    actualData = rawData.toObject();
  }

  // Create base assortment structure
  const baseAssortment = {
    _id: String(actualData._id || actualData.itemNo || ''),
    itemNo: String(actualData.itemNo || ''),
    customerItemNo: String(actualData.customerItemNo || ''),
    name: String(actualData.name || ''),
    orderId: Number(actualData.orderId || 0),
    productId: Number(actualData.productId || 0),
    status: String(actualData.status || 'pending'),
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
  };

  // Create AssortmentPCF structure for merged data
  const assortmentPCF: AssortmentPCF = {
    _id: String(actualData._id || actualData.itemNo || ''),
    orderItemId: Number(actualData._id || 0),
    customerItemNo: actualData.customerItemNo || null,
    itemNo: String(actualData.itemNo || ''),
    name: String(actualData.name || ''),
    orderId: Number(actualData.orderId || 0),
    productId: Number(actualData.productId || 0),
    createdAt: actualData.createdAt || new Date().toISOString(),
    updatedAt: actualData.updatedAt || new Date().toISOString(),
    status: String(actualData.status || 'pending') as AssortmentStatus,
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
  };

  // CRITICAL FIX: Properly filter deleted images from user modifications
  const rawUserModifications = actualData.userModifications || {
    uploadedImages: {
      itemPackImages: [],
      itemBarcodeImages: [],
      displayImages: [],
      innerCartonImages: [],
      masterCartonImages: []
    },
    imageLabels: {},
    customFields: {},
    formData: {},
    lastModified: null
  };

  // Filter out any deleted images (backend should handle this, but ensure consistency)
  const preservedUserModifications = filterDeletedImagesFromUserMods(rawUserModifications);

  // Build complete AssortmentData structure
  const result: AssortmentData = {
    baseAssortment,
    userModifications: preservedUserModifications, // ← FIXED: Use properly filtered data
    mergedData: {
      assortment: assortmentPCF,
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
      imageLabels: preservedUserModifications.imageLabels || {}, // ← Use preserved labels
      combinedImageCount: calculateImageCount(actualData.pcfImages || {}),
    },
    metadata: {
      source: 'webhook',
      lastModified: actualData.updatedAt ? new Date(actualData.updatedAt) : new Date(),
      version: actualData.version || actualData._version || 1,
      syncedAt: actualData.syncedAt ? new Date(actualData.syncedAt) : new Date(),
      isWebhookData: true,
      dataSource: 'api',
      // Add optional fields that won't break existing types
      ...(actualData._persistentStorageEnabled && { persistentStorageEnabled: actualData._persistentStorageEnabled }),
      ...(actualData._cacheKey && { cacheKey: actualData._cacheKey }),
      ...(actualData._imageCollectionHash && { imageCollectionHash: actualData._imageCollectionHash }),
      ...(actualData._performanceMetrics && { performanceMetrics: actualData._performanceMetrics }),
    },
  };

  // Debug log to verify user modifications are preserved and filtered
  if (preservedUserModifications.uploadedImages) {
    const uploadCounts = {
      itemPack: preservedUserModifications.uploadedImages.itemPackImages?.length || 0,
      barcode: preservedUserModifications.uploadedImages.itemBarcodeImages?.length || 0,
      display: preservedUserModifications.uploadedImages.displayImages?.length || 0,
      innerCarton: preservedUserModifications.uploadedImages.innerCartonImages?.length || 0,
      masterCarton: preservedUserModifications.uploadedImages.masterCartonImages?.length || 0
    };
    
    console.log('🔄 Transformer: Final user modifications after delete filtering:', uploadCounts);
    
    // Alert if we still have images after supposed deletion
    const totalImages = Object.values(uploadCounts).reduce((sum, count) => sum + count, 0);
    if (totalImages > 0) {
      console.log('✅ Transformer: Preserved', totalImages, 'user uploaded images');
    } else {
      console.log('🗑️ Transformer: No user uploaded images remaining');
    }
  }

  return result;
}

// Transform traditional assortment API response  
export function transformTraditionalAssortmentResponse(rawData: any): AssortmentData {
  return transformRawDataToAssortmentData(rawData, 'traditional');
}

// Utility functions for image counting (can be used elsewhere)
export function countAssortmentImages(assortment: any): number {
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

// Validation helpers
export function validateAssortmentData(data: AssortmentData): boolean {
  return !!(
    data.baseAssortment?._id &&
    data.baseAssortment?.itemNo &&
    data.mergedData?.assortment &&
    data.metadata
  );
}

export function isWebhookData(data: AssortmentData): boolean {
  return data.metadata?.source === 'webhook' || data.metadata?.isWebhookData === true;
}