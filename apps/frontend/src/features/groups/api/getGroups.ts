import { QueryConfig } from '@/lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { Group } from '..';

export async function getGroups() {
  const res = await api.get<Group[]>('/groups');

  return res.data;
}

export function getGroupsQuery() {
  return {
    queryKey: [QUERY_KEYS.GROUPS],
    queryFn: getGroups,
  };
}

type QueryFnType = typeof getGroups;

export function useGetGroups(options?: QueryConfig<QueryFnType>) {
  return useQuery({
    ...options,
    ...getGroupsQuery(),
  });
}
