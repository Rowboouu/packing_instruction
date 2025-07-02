import { Icons } from '@/components/icons';
import PageHeader from '@/components/page-header';
import { TextArea } from '@/components/text-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormField, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useModalStore } from '@/lib/store/modalStore';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import {
  SendEmailInput,
  sendEmailSchema,
  useAttachmentStore,
  useSendEmail,
} from '..';
import { AttachmentCard } from '../components/attachment-card';
import { AttachmentSelection } from '../components/attachment-selection';

export function EmailCompose() {
  const { t } = useTranslation();
  const { setModal, closeModal } = useModalStore();
  const { selected, resetSelection } = useAttachmentStore();

  const form = useForm<SendEmailInput>({
    resolver: zodResolver(sendEmailSchema),
  });

  const mutate = useSendEmail({
    onSettled: () => {
      form.reset();
      resetSelection();
    },
  });

  React.useEffect(() => {
    form.setValue(
      'items',
      selected.map((item) => ({
        item_id: item._id,
        item_name: item.customerItemNo + ' Package Confirmation Form.pdf',
        item_size: item.item_size,
      })),
    );

    return () => {
      form.setValue('items', []);
    };
  }, [selected]);

  function handleSetModel() {
    setModal({
      component: {
        title: t('keyButton_attachItems'),
        body: <AttachmentSelection />,
        footer: (
          <Button>
            <span className="px-2" onClick={closeModal}>
              <Trans i18nKey={'keyButton_select'} />
            </span>
          </Button>
        ),
      },
    });
  }

  function onSubmit(data: SendEmailInput) {
    mutate.mutate(data);
  }

  return (
    <>
      <PageHeader>
        <Trans i18nKey="keyNavigation_emails" />
      </PageHeader>
      <div className="col-auto col-xl-8">
        <Card className="">
          <Form {...form}>
            <form
              className="card-body"
              onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
            >
              <div className="d-flex flex-column h-100">
                <div className="row g-3 mb-2">
                  <div className="col-6">
                    <FormField
                      control={form.control}
                      name="to"
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <label className="form-label">
                            <Trans i18nKey={'keyField_to'} />
                          </label>
                          <Input
                            placeholder={t('keyField_to')}
                            error={error}
                            {...field}
                          />
                          <FormMessage />
                        </>
                      )}
                    />
                  </div>
                  <div className="col-6">
                    <FormField
                      control={form.control}
                      name="from"
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <label className="form-label">
                            <Trans i18nKey={'keyField_from'} />
                          </label>
                          <Input
                            placeholder={t('keyField_from')}
                            error={error}
                            {...field}
                          />
                          <FormMessage />
                        </>
                      )}
                    />
                  </div>
                  <div className="col-12">
                    <FormField
                      control={form.control}
                      name="cc"
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <label className="form-label">CC</label>
                          <Input
                            placeholder={t('keyMessage_cc')}
                            error={error}
                            {...field}
                          />
                          <FormMessage />
                        </>
                      )}
                    />
                  </div>
                  <div className="col-12">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <label className="form-label">
                            <Trans i18nKey={'keyField_subject'} />
                          </label>
                          <Input
                            placeholder={t('keyField_subject')}
                            error={error}
                            {...field}
                          />
                          <FormMessage />
                        </>
                      )}
                    />
                  </div>
                </div>
                <div className="col-12">
                  <FormField
                    control={form.control}
                    name="items"
                    render={({ fieldState: { error } }) => (
                      <>
                        <label
                          className={cn(
                            'form-label',
                            error ? 'text-danger' : '',
                          )}
                        >
                          <Trans i18nKey={'keyField_attachments'} />
                        </label>
                        <div className="row mb-2 gx-0 gy-2">
                          {selected.map((item) => (
                            <AttachmentCard key={item._id} item={item} />
                          ))}

                          <div className="col-auto d-flex align-items-center">
                            <Button
                              type="button"
                              className="d-flex"
                              variant="phoenix-primary"
                              onClick={handleSetModel}
                            >
                              <span className="ms-2 fs--0">
                                <Trans i18nKey="keyButton_attachItems" />
                              </span>
                              <Icons.Paperclip height={14} />
                            </Button>
                          </div>
                        </div>
                        <FormMessage />
                      </>
                    )}
                  />
                </div>

                <div className="col-12 mb-2">
                  <div className="col-12">
                    <FormField
                      control={form.control}
                      name="body"
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <label className="form-label">
                            <Trans i18nKey={'keyField_message'} />
                          </label>
                          <TextArea
                            placeholder={t('keyField_message')}
                            rows={5}
                            style={{
                              minHeight: '150px',
                            }}
                            error={error}
                            {...field}
                          />
                          <FormMessage />
                        </>
                      )}
                    />
                  </div>
                </div>

                <div className="d-flex w-100 justify-content-end">
                  <Button>
                    <span className="ms-2 fs--0">
                      <Trans i18nKey="keyButton_send" />
                    </span>
                    <Icons.Send height={16} />
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
}
