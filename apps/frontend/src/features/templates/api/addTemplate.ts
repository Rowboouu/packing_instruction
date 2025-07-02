import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';

export const addTemplateSchema = z.object({
  name: z.string().min(1, { message: 'Please input a name' }).max(255),
  code: z.string().min(1, { message: 'Please input a code' }).max(255),
  isActive: z.boolean().optional(),
  file: z.instanceof(File, { message: 'Please select a file' }),
});

export type AddTemplateDTO = z.infer<typeof addTemplateSchema>;

export function addTemplate(data: AddTemplateDTO) {
  return api.post('/templates', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

type MutationFnType = typeof addTemplate;

export function useAddTemplate(options?: MutationConfig<MutationFnType>) {
  return useMutation({
    ...options,
    mutationFn: addTemplate,
  });
}
