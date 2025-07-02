import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import {
  QueryFunctionContext,
  QueryMeta,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { Retake } from '..';

export interface QueryParams extends QueryMeta {
  limit?: number;
  page?: number;
}

export interface APIResponse {
  items: Retake[];
  totalItems: number;
  nextPage: number;
  prevPage: number;
  totalPages: number;
  page: number;
  limit: number;
}

export async function fetchRetakes(params: QueryParams) {
  const res = await api.get<APIResponse>('/retakes', {
    params,
  });
  return res.data;
}

export function getRetakes({ pageParam, meta }: QueryFunctionContext) {
  return fetchRetakes({ ...meta, page: pageParam as number });
}

export function useGetInfiniteRetakes(params?: QueryParams) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.INFINITE_UPLOAD_EVENTS, params],
    queryFn: getRetakes,
    meta: params,
    initialPageParam: params?.page ?? 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  });
}
