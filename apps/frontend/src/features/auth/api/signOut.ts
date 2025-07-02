import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';
import { UserResource } from '..';

export async function signOut() {
  return api.post<UserResource>('/auth/sign-out');
}

type MutationFnType = typeof signOut;

export function useSignOut(options?: MutationConfig<MutationFnType>) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    onSuccess: (response) => {
      navigate('/');
      queryClient.setQueryData([QUERY_KEYS.AUTH_USER], response.data);
    },
    ...options,
    mutationFn: signOut,
  });
}
