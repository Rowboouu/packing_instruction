import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { QueryConfig } from '@/lib/react-query';
import { Template } from '..';

export async function getTemplate(userId: string) {
  const res = await api.get<Template>(`/templates/${userId}`);
  return res.data;
}

type ParamFnType = Parameters<typeof getTemplate>[0];
type QueryFnType = typeof getTemplate;

export const getTemplateQuery = (param: ParamFnType) => ({
  queryKey: [QUERY_KEYS.TEMPLATES, param],
  queryFn: () => getTemplate(param),
});

export function useGetTemplate(
  param: ParamFnType,
  options?: QueryConfig<QueryFnType>,
) {
  return useQuery({
    ...options,
    ...getTemplateQuery(param),
  });
}
