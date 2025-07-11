// @/features/packing-instructions/types/index.ts

import { FileData } from '@/features/files';
import { PcfImage } from '@/features/pcf-images';

export interface Assortment {
  _id: string;
  orderItemId: number;
  customerItemNo: string | null;
  itemNo: string;
  name: string;
  orderId: number;
  productId: number;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'todo' | 'ongoing' | 'completed' | 'approved';
  uploadStatus: 'pending' | 'in-progress' | 'completed';
  
  // Dimensions from webhook
  length_cm: number;
  width_cm: number;
  height_cm: number;
  master_carton_length_cm: number;
  master_carton_width_cm: number;
  master_carton_height_cm: number;
  inner_carton_length_cm: number;
  inner_carton_width_cm: number;
  inner_carton_height_cm: number;
  
  // Optional legacy image (might not be used with webhook data)
  image?: FileData;
  
  // User-modifiable fields (can be updated via forms)
  masterCUFT?: number;
  masterGrossWeight?: number;
  productInCarton?: number;
  productPerUnit?: number;
  
  // Optional additional fields
  labels?: Record<string, { id: number; value: string; name: string }>[];
  itemInCarton?: number;
  itemPerUnit?: number;
  itemCUFT?: number;
  itemGrossWeight?: number;
  unit?: string;
  cubicUnit?: string;
  wtUnit?: string;
}

// PCF-specific interface with structured images
export interface AssortmentPCF extends Assortment {
  pcfImages: {
    itemPackImages: PcfImage[][] | any[][]; // Support both user uploads and webhook structure
    itemBarcodeImages: PcfImage[] | any[];
    displayImages: PcfImage[] | any[];
    innerCartonImages: PcfImage[] | any[];
    masterCartonImages: PcfImage[] | any[];
  };
}

// Webhook image structure from Odoo
export interface WebhookImage {
  id: number;
  componentName: string;
  image: string; // Base64 encoded
  filename: string;
}

export interface WebhookPcfImages {
  itemPackImages: WebhookImage[][];
  itemBarcodeImages: WebhookImage[];
  displayImages: WebhookImage[];
  innerCartonImages: WebhookImage[];
  masterCartonImages: WebhookImage[];
}

// Individual assortment from webhook
export interface WebhookAssortment {
  _id: number;
  customerItemNo: string;
  itemNo: string;
  name: string;
  orderId: number;
  productId: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  master_carton_length_cm: number;
  master_carton_width_cm: number;
  master_carton_height_cm: number;
  inner_carton_length_cm: number;
  inner_carton_width_cm: number;
  inner_carton_height_cm: number;
  pcfImages: WebhookPcfImages;
}

// Sales order from webhook
export interface WebhookSalesOrder {
  id: string;
  customer: string;
  customer_po?: string;
}

// Complete webhook payload
export interface WebhookData {
  orderName: string;
  salesOrder: WebhookSalesOrder;
  assortments: WebhookAssortment[];
  status: string;
  receivedAt: string;
  processedAt?: string;
  metadata?: {
    totalImages: number;
    assortmentCount: number;
    source: string;
    odooVersion?: string;
  };
}

// Component structure for detailed assortment data
export interface ComponentData {
  componentNo: string; // "COMP001", "PACK001", etc.
  type: 'main_product' | 'packaging' | 'additional_product' | 'master_carton';
  originalImages: string[]; // URLs or base64 from webhook
  webhookImages: WebhookImage[]; // Original webhook images
  specifications: Record<string, any>;
}

// User modifications stored in database
export interface UserModifications {
  uploadedImages: {
    [componentNo: string]: {
      itemPackImages: PcfImage[];
      itemBarcodeImages: PcfImage[];
      displayImages: PcfImage[];
      innerCartonImages: PcfImage[];
      masterCartonImages: PcfImage[];
    };
  };
  imageLabels: Record<string, string>;
  customFields: Record<string, any>;
  formData: {
    productInCarton?: number;
    productPerUnit?: number;
    masterCUFT?: number;
    masterGrossWeight?: number;
    unit?: string;
    cubicUnit?: string;
    wtUnit?: string;
  };
}

// Complete assortment data (webhook + database merged)
export interface AssortmentData {
  // Original webhook data
  baseAssortment: {
    _id: string;
    itemNo: string;
    customerItemNo?: string;
    name: string;
    orderId?: number;
    productId?: number;
    status: string;
    // Dimensions
    length_cm: number;
    width_cm: number;
    height_cm: number;
    master_carton_length_cm: number;
    master_carton_width_cm: number;
    master_carton_height_cm: number;
    inner_carton_length_cm: number;
    inner_carton_width_cm: number;
    inner_carton_height_cm: number;
    // Images from webhook
    webhookImages: WebhookPcfImages;
    // Components (if using component structure)
    components?: ComponentData[];
    // Source info
    sourceOrderName?: string;
    salesOrder?: WebhookSalesOrder;
  };

  // User modifications from database
  userModifications: UserModifications;

  // Merged/computed data for easy rendering
  mergedData: {
    // This will contain the combined view of webhook + user data
    // Making it easy for components to render without complex merging logic
    assortment: AssortmentPCF;
    allImages: {
      itemPackImages: PcfImage[];
      itemBarcodeImages: PcfImage[];
      displayImages: PcfImage[];
      innerCartonImages: PcfImage[];
      masterCartonImages: PcfImage[];
    };
    webhookImages: WebhookPcfImages; // Keep original webhook images separate
    imageLabels: Record<string, string>;
    combinedImageCount: number;
  };

  // Metadata
  metadata: {
    source: 'webhook' | 'traditional';
    lastModified: Date;
    version: number;
    syncedAt: Date;
    modifiedBy?: string;
    isWebhookData?: boolean;
    dataSource?: 'navigation' | 'api';
  };
}

// UPDATED: Sales Order data (now uses AssortmentData[])
export interface SalesOrderData {
  salesOrder: {
    id: string;
    orderNumber: string;
    customer: string;
    customerPO?: string;
    status: string;
    totalAssortments: number;
    totalImages: number;
    createdAt: string;
    updatedAt: string;
  };
  // FIXED: Changed from simplified objects to full AssortmentData[]
  assortments: AssortmentData[];
  metadata: {
    source: 'webhook' | 'traditional';
    totalImages: number;
    lastUpdated: Date;
  };
}

// DEPRECATED: Keep for backward compatibility if needed
// Legacy sales order assortment structure (for components that still expect it)
export interface LegacyAssortmentSummary {
  _id: string;
  itemNo: string;
  customerItemNo?: string;
  name: string;
  status: 'pending' | 'todo' | 'ongoing' | 'completed' | 'approved';
  hasUserModifications: boolean;
  lastModified?: Date;
  uploadedImageCount: number;
  webhookImageCount: number; // Images from Odoo webhook
  dimensions: {
    length_cm: number;
    width_cm: number;
    height_cm: number;
  };
}

// Helper type for components that need simplified assortment data
export interface AssortmentSummary {
  _id: string;
  itemNo: string;
  customerItemNo?: string;
  name: string;
  status: 'pending' | 'todo' | 'ongoing' | 'completed' | 'approved';
  hasUserModifications: boolean;
  lastModified?: Date;
  uploadedImageCount: number;
  webhookImageCount: number;
  dimensions: {
    length_cm: number;
    width_cm: number;
    height_cm: number;
  };
  // Optional: Include reference to full data
  fullData?: AssortmentData;
}

// DTOs for API requests
export interface UpdateAssortmentDTO {
  _id: string;
  userModifications: Partial<UserModifications>;
  isWebhookData?: boolean; // Flag to indicate data source
}

export interface UploadImagesDTO {
  _id: string;
  componentNo?: string;
  itemPackImages?: File[];
  itemBarcodeImages?: File[];
  displayImages?: File[];
  innerCartonImages?: File[];
  masterCartonImages?: File[];
  imageLabels?: Record<string, string>;
  isWebhookData?: boolean; // Flag for different handling
}

// API Response types
export interface WebhookDataResponse {
  success: boolean;
  data?: WebhookData;
  message?: string;
  orderName: string;
}

export interface IndividualAssortmentResponse {
  success: boolean;
  data?: WebhookAssortment & {
    salesOrder: WebhookSalesOrder;
    orderName: string;
  };
  source?: 'individual' | 'sales_order';
  message?: string;
  assortmentId: string;
}

// Grid/List view item types for data table
export interface PackingInstructionTableItem {
  _id: number;
  customerItemNo: string;
  itemNo: string;
  name: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  master_carton_length_cm: number;
  master_carton_width_cm: number;
  master_carton_height_cm: number;
  inner_carton_length_cm: number;
  inner_carton_width_cm: number;
  inner_carton_height_cm: number;
  imageCount: number; // Total images from webhook
  status: 'pending' | 'todo' | 'ongoing' | 'completed' | 'approved';
  pcfImages: WebhookPcfImages;
}

// Table row data type that matches what DataTable expects
export interface AssortmentRowData {
  _id: string;
  itemNo: string;
  name: string;
  customerItemNo: string;
  status: string;
  imageCount: number;
  webhookImageCount: number; // Required by the table
  length_cm: number;
  width_cm: number;
  height_cm: number;
  master_carton_length_cm: number;
  master_carton_width_cm: number;
  master_carton_height_cm: number;
  inner_carton_length_cm: number;
  inner_carton_width_cm: number;
  inner_carton_height_cm: number;
  pcfImages: WebhookPcfImages;
}

// Utility types for image counting
export interface ImageCounts {
  itemPack: number;
  barcode: number;
  display: number;
  innerCarton: number;
  masterCarton: number;
  total: number;
}

// Status types
export type AssortmentStatus = 'pending' | 'todo' | 'ongoing' | 'completed' | 'approved';
export type DataSource = 'webhook' | 'traditional' | 'navigation';

// Export utility type for component props
export type PackingInstructionComponentProps<T = AssortmentData> = {
  assortment: T;
  isLoading?: boolean;
  dataSource?: DataSource;
};

// Enhanced metadata interface
export interface EnhancedMetadata {
  source: 'traditional' | 'webhook';
  lastModified: Date;
  version: number;
  syncedAt: Date;
  modifiedBy?: string;
  isWebhookData?: boolean;
  dataSource?: 'navigation' | 'api';
  // Optional fields for backward compatibility
  persistentStorageEnabled?: boolean;
  cacheKey?: string;
  imageCollectionHash?: string;
  performanceMetrics?: {
    averageLoadTime?: number;
    cacheHitRate?: number;
    totalCacheHits?: number;
    totalCacheMisses?: number;
    lastPerformanceCheck?: Date;
  };
}

// Enhanced base assortment interface
export interface EnhancedBaseAssortment {
  _id: string;
  itemNo: string;
  customerItemNo?: string;
  name: string;
  orderId?: number;
  productId?: number;
  status: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  master_carton_length_cm: number;
  master_carton_width_cm: number;
  master_carton_height_cm: number;
  inner_carton_length_cm: number;
  inner_carton_width_cm: number;
  inner_carton_height_cm: number;
  webhookImages?: any;
  sourceOrderName?: string;
  salesOrder?: any;
}

// Enhanced query config
export interface EnhancedQueryConfig<T> {
  enabled?: boolean;
  retry?: boolean | number | ((failureCount: number, error: any) => boolean);
  retryDelay?: number | ((attemptIndex: number) => number);
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  refetchInterval?: number | false;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

// Cache statistics interface
export interface CacheStatistics {
  totalQueries: number;
  assortmentQueries: number;
  staleQueries: number;
  cachedAssortments: string[];
}

// Smart hook return type
export interface SmartHookResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: any;
  dataSource: 'webhook-cached' | 'traditional' | 'navigation-fallback';
  cacheStats?: CacheStatistics;
  isSuccess: boolean;
  isError: boolean;
}

export interface BatchDeleteImagesDTO {
  assortmentId: string;
  imageIds: string[]; // An array of filenames to be deleted
}