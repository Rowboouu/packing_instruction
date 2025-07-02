import { QueryConfig } from '@/lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { Permission } from '..';

export async function getPermissions() {
  const res = await api.get<Permission[]>('/permissions');
  return res.data;
}

export const gerPermissionsQuery = () => ({
  queryKey: [QUERY_KEYS.PERMISSIONS],
  queryFn: getPermissions,
});

type QueryFnType = typeof getPermissions;

export function useGetPemissions(options?: QueryConfig<QueryFnType>) {
  return useQuery({
    ...options,
    ...gerPermissionsQuery(),
  });
}
