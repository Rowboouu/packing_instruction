import {
  QueryFunctionContext,
  QueryMeta,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { SalesOrder } from '..';

export interface QueryParams extends QueryMeta {
  keyword?: string;
  limit?: number;
  page?: number;
}

export interface SalesOrderResponse {
  items: SalesOrder[];
  totalItems: number;
  nextPage: number;
  prevPage: number;
  totalPages: number;
  page: number;
  limit: number;
}

export async function fetchsalesOrders(params: QueryParams) {
  const res = await api.get<SalesOrderResponse>('/zulu-sales-orders', {
    params,
  });
  return res.data;
}

export function getsalesOrders({ pageParam, meta }: QueryFunctionContext) {
  return fetchsalesOrders({ ...meta, page: pageParam as number });
}

export function useGetInfiniteSalesOrder(params?: QueryParams) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.INFINITE_SALES_ORDERS, params],
    queryFn: getsalesOrders,
    meta: params,
    initialPageParam: params?.page ?? 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  });
}
