// @/features/packing-instructions/types/index.ts

import { AssortmentPCF } from '@/features/assortments';
import { PcfImage } from '@/features/pcf-images';

// Sales Order data from webhook
export interface SalesOrderData {
  salesOrder: {
    id: string;
    orderNumber: string;
    customer: string;
    status: string;
  };
  assortments: Array<{
    _id: string; // "A000026"
    itemNo: string; // "ITEM001"
    name: string; // "Beer Opener Keychain"
    status: 'todo' | 'ongoing' | 'completed' | 'approved';
    hasUserModifications: boolean; // true if user uploaded images/made changes
    lastModified?: Date;
    uploadedImageCount: number; // count of user-uploaded images
  }>;
}

// Component structure for detailed assortment data
export interface ComponentData {
  componentNo: string; // "COMP001", "PACK001", etc.
  type: 'main_product' | 'packaging' | 'additional_product' | 'master_carton';
  originalImages: string[]; // URLs from webhook/main system
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
    name: string;
    status: string;
    components: ComponentData[];
    // ... other webhook fields
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
    imageLabels: Record<string, string>;
  };

  // Metadata
  metadata: {
    lastModified: Date;
    version: number;
    syncedAt: Date;
    modifiedBy?: string;
  };
}

// DTOs for API requests
export interface UpdateAssortmentDTO {
  _id: string;
  userModifications: Partial<UserModifications>;
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
}
