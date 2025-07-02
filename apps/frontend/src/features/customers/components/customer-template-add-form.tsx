import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormField, FormMessage } from '@/components/ui/form';
import { QUERY_KEYS } from '@/constant/query-key';
import {
  CreateCustomerTemplateDto,
  CustomerSelect,
  TemplateSelect,
  createCustomerTemplateDtoSchema,
  useCreateCustomerTemplate,
} from '..';

export function CustomerTemplateAddForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<CreateCustomerTemplateDto>({
    resolver: zodResolver(createCustomerTemplateDtoSchema),
    defaultValues: {
      customerId: 0,
      name: '',
      template: '',
    },
  });

  const { mutate, isPending } = useCreateCustomerTemplate({
    onSuccess: () => {
      form.reset();
      toast.success('Created customer template successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CUSTOMER_TEMPLATES],
      });
    },
    onError: (error) => {
      const res = error.response;

      const message = res?.data?.message || error.message;
      form.setError('customerId', { message });
    },
  });

  function onSubmit(data: CreateCustomerTemplateDto) {
    mutate(data);
  }

  function handleCancelClick() {
    form.formState.isDirty ? form.reset() : navigate('/config/customers');
  }

  return (
    <Form {...form}>
      <form
        className="auth-form-box needs-validation"
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <div className="col-auto col-lg-8 col-xl-6 mb-4">
          <Card>
            <CardContent className="p-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <div className="row">
                    <label className="col-form-label">Customer</label>
                    <CustomerSelect
                      value={{ value: field.value, label: form.watch('name') }}
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption?.value);
                        form.setValue('name', selectedOption?.label ?? '');
                      }}
                    />
                    <FormMessage />
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="template"
                render={({ field, fieldState: { error } }) => (
                  <div className="row">
                    <label className="col-form-label">Template</label>
                    <TemplateSelect error={error} {...field} />
                    <FormMessage />
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </div>
        <div className="col-auto col-lg-8 col-xl-6 d-flex justify-content-end">
          <Button
            variant="phoenix-primary"
            className="me-2 mb-2 mb-sm-0"
            type="button"
            onClick={handleCancelClick}
            disabled={isPending}
          >
            {form.formState.isDirty ? 'Discard' : 'Cancel'}
          </Button>
          <Button className="mb-2 mb-sm-0" disabled={isPending}>
            <span className="px-2">Save</span>
            {isPending ? (
              <Icons.LoaderSpinner
                height={16}
                width={16}
                className="custom-spinner"
              />
            ) : (
              <Icons.FiChevronRight height={16} width={16} />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
