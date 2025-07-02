import { QueryConfig } from '@/lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { CustomerTemplate } from '..';

export async function getCustomerTemplate() {
  const res = await api.get<CustomerTemplate[]>('/customer-templates');
  return res.data;
}

type QueryFnType = typeof getCustomerTemplate;

export const getCustomerTemplateQuery = () => ({
  queryKey: [QUERY_KEYS.CUSTOMER_TEMPLATES],
  queryFn: getCustomerTemplate,
});

export function useGetCustomerTemplate(options?: QueryConfig<QueryFnType>) {
  return useQuery({
    ...options,
    ...getCustomerTemplateQuery(),
  });
}
