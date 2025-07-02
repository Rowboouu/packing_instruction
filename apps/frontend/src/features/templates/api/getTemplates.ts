import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { QueryConfig } from '@/lib/react-query';
import { Template } from '..';

export async function getTemplates() {
  const res = await api.get<Template[]>('/templates');
  return res.data;
}

export const getTemplatesQuery = () => ({
  queryKey: [QUERY_KEYS.TEMPLATES],
  queryFn: getTemplates,
});

type QueryFnType = typeof getTemplates;

export function useGetTemplates(options?: QueryConfig<QueryFnType>) {
  return useQuery({
    ...options,
    ...getTemplatesQuery(),
  });
}
