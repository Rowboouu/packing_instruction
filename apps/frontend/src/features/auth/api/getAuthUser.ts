import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { QueryConfig } from '@/lib/react-query';
import { AuthResources } from '..';

export async function getAuthUser() {
  const res = await api.get<AuthResources>('/auth/me');
  return res.data;
}

export const getAuthUserQuery = () => ({
  queryKey: [QUERY_KEYS.AUTH_USER],
  queryFn: getAuthUser,
});

type QueryFnType = typeof getAuthUser;

export function useGetAuthUser(options?: QueryConfig<QueryFnType>) {
  return useQuery({
    notifyOnChangeProps: 'all',
    ...options,
    ...getAuthUserQuery(),
  });
}
