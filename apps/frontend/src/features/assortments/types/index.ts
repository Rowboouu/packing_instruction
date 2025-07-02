import { FileData } from '@/features/files';
import { PcfImage } from '@/features/pcf-images';

export interface Assortment {
  _id: string;
  orderItemId: 19381;
  customerItemNo: string | null;
  itemNo: string;
  name: string;
  orderId: number;
  productId: number;
  createdAt: string;
  updatedAt: string;
  status: 'todo' | 'ongoing' | 'completed' | 'approved';
  uploadStatus: 'pending' | 'in-progress' | 'completed';
  image?: FileData;
  masterCUFT: string;
  masterGrossWeight: string;
  productInCarton: number;
  productPerUnit: number;
  labels?: Record<string, { id: number; value: string; name: string }>[];

  itemInCarton?: number;
  itemPerUnit?: number;
  itemCUFT?: number;
  itemGrossWeight?: number;
  unit?: string;
  cubicUnit?: string;
  wtUnit?: string;
}

export interface AssortmentPCF extends Assortment {
  pcfImages: PcfImage[];
}
