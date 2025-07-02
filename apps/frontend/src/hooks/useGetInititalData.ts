import { useQueryClient } from '@tanstack/react-query';

interface QueryParams<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
}

export default function useGetInitialData<T>(params: QueryParams<T>) {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<T>([params.queryKey]);
}
