import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';

import { QUERY_KEYS } from '@/constant/query-key';
import { AuthResources } from '@/features/auth';
import { User } from '@/features/users';
import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';

export const updateUserLanguageSchema = z.object({
  _id: z.string(),
  language: z.string(),
});

export type UpdateUserLangugeDTO = z.infer<typeof updateUserLanguageSchema>;

export async function editUserLanguage(data: UpdateUserLangugeDTO) {
  return api.patch<User>(`/users/${data._id}`, data, {});
}

type MutationFnType = typeof editUserLanguage;

export function useUpdateUserLanguage(
  options?: MutationConfig<MutationFnType>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    onMutate: async (data) => {
      const { language } = data as UpdateUserLangugeDTO;
      const prevState = queryClient.getQueryData<AuthResources>([
        QUERY_KEYS.AUTH_USER,
      ]);

      queryClient.setQueryData<AuthResources>([QUERY_KEYS.AUTH_USER], (old) => {
        if (!old || !old.user) return old;
        return {
          ...old,
          user: {
            ...old.user,
            language, // replace with the variable holding the selected language
          },
        };
      });

      return { prevState };
    },
    onError: (_err, _newTodo, context) => {
      const prev = context as { prevState?: AuthResources };
      queryClient.setQueryData([QUERY_KEYS.AUTH_USER], prev.prevState);
    },
    mutationFn: editUserLanguage,
  });
}
