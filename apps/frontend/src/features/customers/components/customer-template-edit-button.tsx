import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormMessage } from '@/components/ui/form';
import { QUERY_KEYS } from '@/constant/query-key';
import { useModalStore } from '@/lib/store/modalStore';
import {
  CustomerTemplate,
  EditCustomerTemplateDto,
  TemplateSelect,
  editCustomerTemplateDtoSchema,
  useEditCustomerTemplate,
} from '..';

interface CustomerTemplateEditButtonProps {
  item: CustomerTemplate;
}

export function CustomerTemplateEditButton({
  item,
}: CustomerTemplateEditButtonProps) {
  const queryClient = useQueryClient();
  const { setModal, closeModal } = useModalStore();

  const form = useForm<EditCustomerTemplateDto>({
    resolver: zodResolver(editCustomerTemplateDtoSchema),
    defaultValues: {
      _id: item._id,
      customerId: item.customerId,
      name: item.name,
      template: item.template._id,
    },
  });

  const { mutate, isPending } = useEditCustomerTemplate({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CUSTOMER_TEMPLATES],
      });
      toast.success('Customer template updated successfully');
    },
  });

  function onSubmit(data: EditCustomerTemplateDto) {
    mutate(data);
  }

  function handleCloseClick() {
    closeModal();
    form.reset();
  }

  function handleEditClick() {
    setModal({
      component: {
        title: `${item.name} Template`,
        body: (
          <Form {...form}>
            <form
              className="auth-form-box needs-validation"
              onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
            >
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
              <div className="modal-footer">
                <Button
                  variant={'phoenix-primary'}
                  type="button"
                  onClick={handleCloseClick}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button className="mb-2 mb-sm-0" disabled={isPending}>
                  <span className="px-2">Save Changes</span>
                  {isPending && (
                    <Icons.LoaderSpinner
                      height={16}
                      width={16}
                      className="custom-spinner"
                    />
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ),
      },
      option: {
        // centered: true,
        // animation: false,
        scrollable: true,
        keyboard: false,
      },
    });
  }
  return (
    <a
      href="#"
      className="mb-0 ms-3 fw-semi-bold text-capitalize"
      onClick={handleEditClick}
    >
      Edit
    </a>
  );
}
