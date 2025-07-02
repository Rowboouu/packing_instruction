import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';
import { User } from '..';

export const addUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, { message: 'Please input a name' }).max(255),
  password: z
    .string()
    .min(8, {
      message: 'Password must be at least 8 characters long',
    })
    .max(100),
  role: z.string(),
  permission: z.string(),
  language: z.string().default('en'),
});

export type AddUserDTO = z.infer<typeof addUserSchema>;

export async function addUser(data: AddUserDTO) {
  return api.post<User>('/users', data, {});
}

type MutationFnType = typeof addUser;

export function useAddUser(options?: MutationConfig<MutationFnType>) {
  return useMutation({
    ...options,
    mutationFn: addUser,
  });
}
