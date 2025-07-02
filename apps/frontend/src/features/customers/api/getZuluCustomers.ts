import {
  QueryFunctionContext,
  QueryMeta,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { Customer, ZuluMetaData } from '..';

export interface ZuluCustomerParams extends QueryMeta {
  keyword?: string;
  per_page?: number;
  page?: number;
}

export interface ZuluCustomerResponse {
  items: Customer[];
  meta_data: ZuluMetaData;
}

export async function fetchZuluCustomers(params: ZuluCustomerParams) {
  const res = await api.get<ZuluCustomerResponse>('/zulu-customers', {
    params,
  });
  return res.data;
}

export async function getZuluCustomers({
  pageParam,
  meta,
}: QueryFunctionContext) {
  return await fetchZuluCustomers({ ...meta, page: pageParam as number });
}

export function useGetInfiniteZuluCustomers(params?: ZuluCustomerParams) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.ZULU_CUSTOMERS, params],
    queryFn: getZuluCustomers,
    meta: params,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.meta_data.next_page,
  });
}
