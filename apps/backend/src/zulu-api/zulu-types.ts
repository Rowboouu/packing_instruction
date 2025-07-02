export type Label = Record<string, { id: number; name: string; value: string }>;
export interface ZuluAssortment {
  id: number;
  name: string;
  item_number_search: string;
  product_id: [number, string];
  order_id: [number, string];
  customer_item_number?: string | false;
  master_cuft_st: string | false;
  master_gross_weight_lbs_st: string | false;
  products_in_carton_st: number;
  products_per_unit_st: number;
  labels: Label[];
}

export interface ZuluSalesOrder {
  name: string;
  order_line: number[];
  customer_po_number: string;
  id: number;
  partner_id: [number, string];
  promised_delivery_date?: string | false;
  state: string;
}
