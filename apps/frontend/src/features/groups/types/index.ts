import { SalesOrder } from '@/features/sales-orders';

export interface Group {
  _id: string;
  name: string;
  customers: { id: number; name: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupSalesOrder extends Group {
  salesOrders: SalesOrder[];
}
