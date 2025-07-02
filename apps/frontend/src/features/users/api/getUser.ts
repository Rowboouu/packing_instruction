import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { QueryConfig } from '@/lib/react-query';
import { User } from '..';

export async function getUser(userId: string) {
  const res = await api.get<User>(`/users/${userId}`);
  return res.data;
}

type ParamFnType = Parameters<typeof getUser>[0];
type QueryFnType = typeof getUser;

export const getUserQuery = (param: ParamFnType) => ({
  queryKey: [QUERY_KEYS.USERS, param],
  queryFn: () => getUser(param),
});

export function useGetUser(
  param: ParamFnType,
  options?: QueryConfig<QueryFnType>,
) {
  return useQuery({
    ...options,
    ...getUserQuery(param),
  });
}
