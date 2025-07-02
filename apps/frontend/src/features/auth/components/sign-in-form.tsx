import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Icons } from '@/components/icons';
import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SignInDTO, signInSchema, useSignInUser } from '..';

export function SignInForm() {
  const form = useForm<SignInDTO>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate, isPending } = useSignInUser({
    onError: (error) => {
      const res = error.response;
      if (res && res?.status < 500) {
        const message = res?.data?.message || error.message;
        form.setError('email', { message }, { shouldFocus: true });
        form.setError('password', { message: '' });
      }
    },
  });

  function onSubmit(values: SignInDTO) {
    mutate(values);
  }

  return (
    <Form {...form}>
      <form
        className="auth-form-box needs-validation"
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <div className="text-center mt-10 my-7">
          <h3 className="text-1000">Sign In</h3>
          <p className="text-700">Get access to your account</p>
        </div>

        <div className="mb-3">
          <FormField
            control={form.control}
            name="email"
            disabled={isPending}
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="john.doe@example.com"
                    type="text"
                    leftIcon="UUser"
                    error={error}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mb-10">
          <FormField
            control={form.control}
            name="password"
            disabled={isPending}
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="password"
                    error={error}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="w-100 mb-10 d-flex justify-content-center"
          disabled={isPending}
        >
          {isPending && (
            <Icons.LoaderSpinner
              height={16}
              width={16}
              className="custom-spinner"
            />
          )}
          <span className="px-2">Sign In</span>
        </Button>
      </form>
    </Form>
  );
}
