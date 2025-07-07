import { FileData } from '@/features/files';

export type PcfImage = {
  id: string;
  _id: string;
  componentName: string;
  filename:string;
  field: string;
  isApproved: boolean;
  sequence: 0;
  fileData: FileData;
  barcodeErrors?: string[];
  createdAt: string;
  updatedAt: string;
};
