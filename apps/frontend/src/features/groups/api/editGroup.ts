import { MutationConfig } from '@/lib/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';

import { QUERY_KEYS } from '@/constant/query-key';
import { api } from '@/lib/axios-client';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Group } from '..';

const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const editGroupSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, { message: 'Please input a name' }).max(255),
  customers: z.array(customerSchema).min(1),
});

export type EditGroupDTO = z.infer<typeof editGroupSchema>;

export function editGroup({ _id, ...data }: EditGroupDTO) {
  return api.patch<Group>(`/groups/${_id}`, data);
}

type MutationFnType = typeof editGroup;

export function useEditGroup(options?: MutationConfig<MutationFnType>) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    onMutate: (variable) => {
      const prevGroups = queryClient.getQueryData<Group[]>([QUERY_KEYS.GROUPS]);
      const prevGroup = queryClient.getQueryData<Group>([
        QUERY_KEYS.GROUPS,
        variable._id,
      ]);
      if (typeof variable !== 'undefined' && prevGroups) {
        queryClient.setQueryData<Group[]>([QUERY_KEYS.GROUPS], (prev) =>
          prev?.map((group) => {
            if (group._id === variable._id) {
              return { ...group, ...variable };
            }
            return group;
          }),
        );

        queryClient.setQueryData<Group>(
          [QUERY_KEYS.GROUPS, variable._id],
          (prev) => ({ ...prev, ...variable }) as Group,
        );
      }

      return { prevGroups, prevGroup };
    },
    onSettled: (_data, _err, variable) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GROUPS, variable._id],
      });
    },
    onSuccess: (res) => {
      toast.success(t('keyMessage_groupEditSuccess'));
      if (res) {
        queryClient.setQueryData<Group>(
          [QUERY_KEYS.GROUPS, res.data._id],
          (prev) => ({ ...prev, ...res.data }),
        );
      }
    },
    onError: (_err, variable, context) => {
      queryClient.setQueryData([QUERY_KEYS.GROUPS], context?.prevGroups);
      queryClient.setQueryData(
        [QUERY_KEYS.GROUPS, variable._id],
        context?.prevGroup,
      );
    },
    mutationFn: editGroup,
  });
}
