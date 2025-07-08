// @/features/packing-instructions/types/index.ts

import { AssortmentPCF } from '@/features/assortments';
import { PcfImage } from '@/features/pcf-images';

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

// Sales Order data (transformed for UI)
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
  assortments: Array<{
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
  }>;
  metadata: {
    source: 'webhook' | 'traditional';
    totalImages: number;
    lastUpdated: Date;
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

// REMOVED: SaveIndividualAssortmentDTO and SaveIndividualAssortmentResponse
// These are now only exported from ./api/saveIndividualAssortment

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