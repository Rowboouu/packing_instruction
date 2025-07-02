import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Ref, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    React.AriaAttributes {
  error?: FieldError;
  leftIcon?: keyof typeof Icons;
  rightIcon?: React.ReactNode;
  value?: string | readonly string[] | number | undefined;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { type, leftIcon, rightIcon, error, ...props }: InputProps,
    ref: Ref<HTMLInputElement>,
  ) => {
    const LeftIcon = leftIcon ? Icons[leftIcon] : null;

    return (
      <div className="form-icon-container">
        <input
          type={type}
          className={cn(
            'form-control',
            rightIcon ? 'custom-padding-right' : '',
            leftIcon ? 'form-icon-input' : '',
            error ? 'is-invalid' : '',
          )}
          ref={ref}
          {...props}
        />
        {LeftIcon ? (
          <LeftIcon
            className="text-900 fs--1 form-icon"
            width="15"
            height="15"
          />
        ) : undefined}
        {rightIcon ?? rightIcon}
      </div>
    );
  },
);
export { Input };
