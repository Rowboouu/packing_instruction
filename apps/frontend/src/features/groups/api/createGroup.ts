import { MutationConfig } from '@/lib/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as z from 'zod';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { Group } from '..';

const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const createGroupSchema = z.object({
  name: z.string().min(1, { message: 'Please input a name' }).max(255),
  customers: z.array(customerSchema).min(1),
});

export type CreateGroupDTO = z.infer<typeof createGroupSchema>;

export function createGroup(data: CreateGroupDTO) {
  return api.post('/groups', data);
}

type MutationFnType = typeof createGroup;

export function useCreateGroup(options?: MutationConfig<MutationFnType>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    onMutate: (variable) => {
      const oldGroups = queryClient.getQueryData<Group[]>([QUERY_KEYS.GROUPS]);
      if (typeof variable !== 'undefined' && oldGroups) {
        const newGroup: Group = {
          ...variable,
          _id: '',
          createdAt: '',
          updatedAt: '',
        };

        queryClient.setQueryData<Group[]>([QUERY_KEYS.GROUPS], (old) => {
          if (!old) return old;
          return [...old, newGroup].sort((a, b) =>
            a.name.localeCompare(b.name),
          );
        });
      }

      return { oldGroups };
    },
    onSuccess: () => {
      toast.success('Group has been created!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GROUPS] });
    },
    onError: (_err, _newTodo, context) => {
      const prev = context as { oldGroups?: Group[] };
      queryClient.setQueryData([QUERY_KEYS.GROUPS], prev.oldGroups);
    },
    mutationFn: createGroup,
  });
}
