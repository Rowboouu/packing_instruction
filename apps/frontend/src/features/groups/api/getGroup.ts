import { QueryConfig } from '@/lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { GroupSalesOrder } from '..';

export async function getGroup(groupId: string) {
  const res = await api.get<GroupSalesOrder>(`/groups/${groupId}`);

  return res.data;
}

type ParamFnType = Parameters<typeof getGroup>[0];
type QueryFnType = typeof getGroup;

export function getGroupQuery(param: ParamFnType) {
  return {
    queryKey: [QUERY_KEYS.GROUPS, param],
    queryFn: () => getGroup(param),
  };
}

export function useGetGroup(
  param: ParamFnType,
  options?: QueryConfig<QueryFnType>,
) {
  return useQuery({
    ...options,
    ...getGroupQuery(param),
    select: (data) => {
      return {
        ...data,
        salesOrders: data.salesOrders.sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      };
    },
  });
}
