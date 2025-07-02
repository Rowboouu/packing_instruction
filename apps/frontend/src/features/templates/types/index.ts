import { FileData } from '@/features/files';

export interface Template {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
  fileData: FileData;
  createdAt: string;
  updatedAt: string;
}
