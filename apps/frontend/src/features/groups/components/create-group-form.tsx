import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useModalStore } from '@/lib/store/modalStore';
import {
  CreateGroupDTO,
  ZuluCustomerFilter,
  ZuluCustomerSelection,
  createGroupSchema,
  useCreateGroup,
} from '..';

export function CreateGroupForm() {
  const { t } = useTranslation();
  const { closeModal } = useModalStore();

  const form = useForm<CreateGroupDTO>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      customers: [],
    },
  });

  const { mutate, isPending } = useCreateGroup();

  function onSubmit(data: CreateGroupDTO) {
    mutate(data);
    handleCloseClick();
  }

  function handleCloseClick() {
    closeModal();
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        className="auth-form-box needs-validation"
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <div>
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState: { error } }) => (
              <div className="row">
                <label className="col-form-label">{t('keyField_name')}</label>
                <Input
                  placeholder={t('keyPlaceholder_name')}
                  error={error}
                  {...field}
                />
                <FormMessage />
              </div>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="customers"
            render={({ field, fieldState: { error } }) => (
              <>
                <div className="row pb-2">
                  <label className="col-form-label">
                    {t('keyField_customers')}
                  </label>
                  <ZuluCustomerSelection error={error} {...field} />
                  <FormMessage />
                </div>
                <ZuluCustomerFilter {...field} />
              </>
            )}
          />
        </div>
        <div className="modal-footer">
          <Button
            variant={'phoenix-primary'}
            type="button"
            onClick={handleCloseClick}
            disabled={isPending}
          >
            {t('keyButton_cancel')}
          </Button>
          <Button className="mb-2 mb-sm-0" disabled={isPending}>
            <span className="px-2">{t('keyButton_save')}</span>
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
  );
}
