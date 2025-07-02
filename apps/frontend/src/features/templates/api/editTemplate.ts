import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';
import { Template } from '..';

export const editTemplateSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, { message: 'Please input a name' }).max(255),
  code: z.string().min(1, { message: 'Please input a code' }).max(255),
  isActive: z.boolean().optional(),
  file: z.instanceof(File, { message: 'Please select a file' }).optional(),
});

export type EditTemplateDTO = z.infer<typeof editTemplateSchema>;

export async function editTemplate(data: EditTemplateDTO) {
  return api.patch<Template>(`/templates/${data._id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

type MutationFnType = typeof editTemplate;

export function useEditTemplate(options?: MutationConfig<MutationFnType>) {
  return useMutation({
    ...options,
    mutationFn: editTemplate,
  });
}
