import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { QueryConfig } from '@/lib/react-query';
import { User } from '..';

export async function getUsers() {
  const res = await api.get<User[]>('/users');
  return res.data;
}

export const getUsersQuery = () => ({
  queryKey: [QUERY_KEYS.USERS],
  queryFn: getUsers,
});

type QueryFnType = typeof getUsers;

export function useGetUsers(options?: QueryConfig<QueryFnType>) {
  return useQuery({
    ...options,
    ...getUsersQuery(),
  });
}
