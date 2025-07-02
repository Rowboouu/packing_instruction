import {
  QueryFunctionContext,
  QueryMeta,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { Assortment } from '..';

export interface QueryParams extends QueryMeta {
  keyword?: string;
  status?: string;
  limit?: number;
  page?: number;
}

export interface APIResponse {
  items: Assortment[];
  totalItems: number;
  nextPage: number;
  prevPage: number;
  totalPages: number;
  page: number;
  limit: number;
  statusCount: Record<string, number>;
}

export async function fetchAssortments(params: QueryParams) {
  const res = await api.get<APIResponse>('/zulu-assortments', {
    params,
  });
  return res.data;
}

export function getAssortments({ pageParam, meta }: QueryFunctionContext) {
  return fetchAssortments({ ...meta, page: pageParam as number });
}

export function useGetInfiniteAssortment(params?: QueryParams) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.INFINITE_ASSORTMENTS, params],
    queryFn: getAssortments,
    meta: params,
    initialPageParam: params?.page ?? 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  });
}
