import { Assortment } from '@/features/assortments';

export interface SalesOrder {
  _id: string;
  orderId: number;
  createdAt: string;
  customerPoNo: string;
  etd: string | null;
  name: string;
  orderLines: number[];
  orderItems: Assortment[];
  partnerId: number;
  status: string;
  updatedAt: string;
}
