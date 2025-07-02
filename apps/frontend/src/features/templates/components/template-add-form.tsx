import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { SelectInput } from '@/components/select-input';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { QUERY_KEYS } from '@/constant/query-key';
import {
  AddTemplateDTO,
  FileDropzone,
  addTemplateSchema,
  useAddTemplate,
} from '..';

export function TemplateAddForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const form = useForm<AddTemplateDTO>({
    resolver: zodResolver(addTemplateSchema),
    defaultValues: {
      name: '',
      code: '',
      isActive: true,
      file: undefined,
    },
  });

  const { mutate, isPending } = useAddTemplate({
    onSuccess: () => {
      toast.success('Template has been added!');
      form.reset();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEMPLATES] });
    },
    onError: (error) => {
      const res = error.response;
      const message = res?.data?.message || error.message;
      toast.error(res?.statusText, {
        description: message,
      });
    },
  });

  function onSubmit(data: AddTemplateDTO) {
    mutate(data);
  }
  return (
    <Form {...form}>
      <form
        className="auth-form-box needs-validation"
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <div className="col-auto col-lg-8 col-xl-6 mb-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState: { error } }) => (
              <div className="row">
                <label className="col-form-label">Template Name</label>
                <Input placeholder="template name" error={error} {...field} />
                <FormMessage />
              </div>
            )}
          />
        </div>

        <div className="col-auto col-lg-8 col-xl-6 mb-4 d-flex">
          <div className="col-12 col-md-6 pe-1">
            <FormField
              control={form.control}
              name="code"
              render={({ field, fieldState: { error } }) => (
                <>
                  <label className="col-form-label">Code</label>
                  <Input placeholder="code" error={error} {...field} />
                  <FormMessage />
                </>
              )}
            />
          </div>
          <div className="col-12 col-md-6 ps-1">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field, fieldState: { error } }) => (
                <>
                  <label className="col-form-label">Status</label>
                  <SelectInput
                    placeholder="Select permission"
                    error={error}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'deactived', label: 'Deactivated' },
                    ]}
                    value={field.value ? 'active' : 'deactived'}
                    onChange={(e) => {
                      const value = e.target.value === 'active';
                      field.onChange(value);
                    }}
                  />
                  <FormMessage />
                </>
              )}
            />
          </div>
        </div>

        <div className="col-auto col-lg-8 col-xl-6 mb-4">
          <FormField
            control={form.control}
            name="file"
            render={({ field, fieldState: { error } }) => (
              <>
                <FileDropzone {...field} error={error} />
                <FormMessage />
              </>
            )}
          />
        </div>

        <div className="col-auto col-lg-8 col-xl-6 d-flex justify-content-end">
          <Button
            variant="phoenix-primary"
            className="me-2 mb-2 mb-sm-0"
            type="button"
            onClick={() => {
              form.formState.isDirty
                ? form.reset()
                : navigate('/config/templates');
            }}
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
