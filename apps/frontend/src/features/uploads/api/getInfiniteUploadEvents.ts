import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import {
  QueryFunctionContext,
  QueryMeta,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { Uploads } from '..';

export interface QueryParams extends QueryMeta {
  limit?: number;
  page?: number;
}

export interface APIResponse {
  items: Uploads[];
  totalItems: number;
  nextPage: number;
  prevPage: number;
  totalPages: number;
  page: number;
  limit: number;
}

export async function fetchUploadEvents(params: QueryParams) {
  const res = await api.get<APIResponse>('/upload-events', {
    params,
  });
  return res.data;
}

export function getUploadEvents({ pageParam, meta }: QueryFunctionContext) {
  return fetchUploadEvents({ ...meta, page: pageParam as number });
}

export function useGetInfiniteUploadEvents(params?: QueryParams) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.INFINITE_UPLOAD_EVENTS, params],
    queryFn: getUploadEvents,
    meta: params,
    initialPageParam: params?.page ?? 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  });
}
