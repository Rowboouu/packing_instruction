import { FileData } from '@/features/files';

export type PcfImage = {
  _id: string;
  field: string;
  isApproved: boolean;
  sequence: 0;
  fileData: FileData;
  barcodeErrors?: string[];
  createdAt: string;
  updatedAt: string;
};
