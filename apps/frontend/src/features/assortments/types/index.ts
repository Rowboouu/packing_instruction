// Updated Assortment interfaces to be consistent with webhook payload
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
    innerCartonShippingMarks: PcfImage[] | any[]; // Optional shipping marks
    masterCartonMainShippingMarks: PcfImage[] | any[]; // Optional main shipping marks
    masterCartonSideShippingMarks: PcfImage[] | any[]; // Optional side shipping marks
  };
}
