import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';

export const createCustomerTemplateDtoSchema = z.object({
  customerId: z.coerce
    .number({ message: 'Select a customer' })
    .min(1, { message: 'Select a customer' }),
  name: z.string({ message: 'Select a customer' }),
  template: z.string().min(1, { message: 'Template is required' }),
});

export type CreateCustomerTemplateDto = z.infer<
  typeof createCustomerTemplateDtoSchema
>;

export function createCustomerTemplate(data: CreateCustomerTemplateDto) {
  return api.post('/customer-templates', data);
}

type MutationFnType = typeof createCustomerTemplate;

export function useCreateCustomerTemplate(
  options?: MutationConfig<MutationFnType>,
) {
  return useMutation({
    ...options,
    mutationFn: createCustomerTemplate,
  });
}
