import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';

export const editCustomerTemplateDtoSchema = z.object({
  _id: z.string(),
  customerId: z.coerce
    .number({ message: 'Select a customer' })
    .min(1, { message: 'Select a customer' }),
  name: z.string({ message: 'Select a customer' }),
  template: z.string().min(1, { message: 'Template is required' }),
});

export type EditCustomerTemplateDto = z.infer<
  typeof editCustomerTemplateDtoSchema
>;

export function editCustomerTemplate(data: EditCustomerTemplateDto) {
  return api.patch(`/customer-templates/${data._id}`, data);
}

type MutationFnType = typeof editCustomerTemplate;

export function useEditCustomerTemplate(
  options?: MutationConfig<MutationFnType>,
) {
  return useMutation({
    ...options,
    mutationFn: editCustomerTemplate,
  });
}
