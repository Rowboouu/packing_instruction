import { Template } from '@/features/templates/types';

export interface Customer {
  id: number;
  name: string;
}
export interface ZuluMetaData {
  per_page: number;
  search: string | null;
  page_count: number;
  page: number;
  total_count: number;
  next_page: number | null;
}

export interface CustomerTemplate {
  _id: string;
  customerId: number;
  name: string;
  template: Omit<Template, 'fileData'>;
}
