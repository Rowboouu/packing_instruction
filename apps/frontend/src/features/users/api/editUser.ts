import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';
import { User } from '..';

export const editUserSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  name: z.string().min(1, { message: 'Please input a name' }).max(255),
  password: z
    .string()
    .min(8, {
      message: 'Password must be at least 8 characters long',
    })
    .max(100)
    .optional()
    .or(z.literal('')),
  role: z.string(),
  permission: z.string(),
  isActive: z.boolean().optional(),
});

export type EditUserDTO = z.infer<typeof editUserSchema>;

export async function editUser(data: EditUserDTO) {
  return api.patch<User>(`/users/${data._id}`, data, {});
}

type MutationFnType = typeof editUser;

export function useEditUser(options?: MutationConfig<MutationFnType>) {
  return useMutation({
    ...options,
    mutationFn: editUser,
  });
}
