import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';
import { UserResource } from '..';

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter a valid email address' })
    .email({
      message: 'Please enter a valid email address',
    }),
  password: z
    .string()
    .min(1, { message: 'Password must be at least 8 characters long' })
    .min(8, {
      message: 'Password must be at least 8 characters long',
    })
    .max(100),
});

export type SignInDTO = z.infer<typeof signInSchema>;

export const signInMutation = (data: SignInDTO) => {
  return api.post<UserResource>('/auth/sign-in', data);
};

type MutationFnType = typeof signInMutation;

export function useSignInUser(options?: MutationConfig<MutationFnType>) {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: (response) => {
      queryClient.setQueryData([QUERY_KEYS.AUTH_USER], response.data);
    },
    ...options,
    mutationFn: signInMutation,
  });
}
