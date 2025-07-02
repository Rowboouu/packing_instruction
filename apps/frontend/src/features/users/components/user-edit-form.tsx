import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { CardBody } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ConditionalShell } from '@/components/conditional-shell';
import { AvatarContainer } from '@/components/container/avatar-container';
import { Icons } from '@/components/icons';
import { SelectInput } from '@/components/select-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormField, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { VIEW_TYPE, ViewType } from '@/constant';
import { QUERY_KEYS } from '@/constant/query-key';
import { useGetPemissions } from '@/features/permissions';
import { useGeneratePassword } from '@/hooks/useGetRandomPwd';
import { EditUserDTO, User, editUserSchema, useEditUser } from '..';

interface UserEditFormProps {
  viewType?: ViewType;
  user?: User;
}

export function UserEditForm({
  user,
  viewType: view = 'view',
}: UserEditFormProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { generatePassword } = useGeneratePassword(8);

  const form = useForm<EditUserDTO>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      ...user,
    },
  });

  const { data: perms, isLoading: isPermLoading } = useGetPemissions();
  const { mutate, isPending } = useEditUser({
    onSuccess: () => {
      toast.success('User updated successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
    },
    onError: (error) => {
      const res = error.response;
      const message = res?.data?.message || error.message;
      form.setError('email', { message }, { shouldFocus: true });
    },
  });

  const isView = view === VIEW_TYPE.VIEW;

  function onSubmit(data: EditUserDTO) {
    mutate(data);
  }

  return (
    <Form {...form}>
      <form
        className="auth-form-box needs-validation"
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <div className="col-auto col-lg-8 col-xl-6 mb-4">
          <div className="row g-2">
            <Card>
              <CardContent className="p-4">
                <div className="row g-3">
                  <div className="col-12 col-xl-4 d-flex justify-content-center">
                    <div className="avatar avatar-5xl avatar-bordered me-4">
                      <AvatarContainer name={form.watch('name')} />
                    </div>
                  </div>
                  <div className="col-12 col-xl-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field, fieldState: { error } }) => (
                        <div className="row mb-2">
                          <label className="col-form-label">Name</label>
                          <Input
                            placeholder="John doe"
                            error={error}
                            disabled={isView}
                            {...field}
                          />
                          <FormMessage />
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      disabled={isView}
                      render={({ field, fieldState: { error } }) => (
                        <div className="row">
                          <label className="col-form-label">Email</label>
                          <Input
                            placeholder="john.doe@example.com"
                            type="email"
                            error={error}
                            {...field}
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="col-auto col-lg-8 col-xl-6 mb-4">
          <div className="row g-2">
            <Card>
              <CardBody>
                <FormField
                  control={form.control}
                  name="role"
                  disabled={isView}
                  render={({ field, fieldState: { error } }) => (
                    <div className="row">
                      <label className="col-form-label">Company Role</label>
                      <Input placeholder="John doe" error={error} {...field} />
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="permission"
                  disabled={isView}
                  render={({ field, fieldState: { error } }) => (
                    <div className="row">
                      <label className="col-form-label">Permission</label>
                      <SelectInput
                        placeholder="Select permission"
                        isLoading={isPermLoading}
                        error={error}
                        {...field}
                        options={perms?.map((perm) => ({
                          value: perm.name,
                          label: perm.description,
                        }))}
                      />
                      <FormMessage />
                    </div>
                  )}
                />
                <div className="row m-2 mt-4">
                  <div className="g-2 pe-4 my-2">
                    <h5 className="mb-0">Login Details</h5>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  disabled={isView}
                  render={({ field, fieldState: { error } }) => (
                    <div className="row">
                      <label className="col-form-label">Email</label>
                      <Input
                        placeholder="john.doe@example.com"
                        type="email"
                        error={error}
                        {...field}
                      />
                      <FormMessage />
                    </div>
                  )}
                />
                <ConditionalShell condition={!isView}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field, fieldState: { error } }) => (
                      <div className="row">
                        <label className="col-form-label">Password</label>
                        <div
                          className="d-flex align-items-center"
                          style={{ gap: '5px' }}
                        >
                          <div className="w-100">
                            <Input
                              placeholder="password"
                              error={error}
                              {...field}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="success"
                            size="icon"
                            onClick={() => {
                              const newSTring = generatePassword();
                              field.onChange(newSTring);
                            }}
                          >
                            <Icons.LuDices />
                          </Button>
                        </div>
                        <FormMessage />
                      </div>
                    )}
                  />
                </ConditionalShell>
              </CardBody>
            </Card>
          </div>
        </div>
        <ConditionalShell condition={!isView}>
          <div className="col-auto col-lg-8 col-xl-6 d-flex justify-content-end">
            <Button
              variant="phoenix-primary"
              className="me-2 mb-2 mb-sm-0"
              type="button"
              onClick={() => {
                navigate('/users');
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button className="mb-2 mb-sm-0" disabled={isPending}>
              <span className="px-2">Update</span>
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
        </ConditionalShell>
      </form>
    </Form>
  );
}
