import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import React, { Ref, forwardRef, useState } from 'react';
import { FieldError } from 'react-hook-form';

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    React.AriaAttributes {
  error?: FieldError;
  isNoIcon?: boolean;
  value?: string | number | readonly string[];
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { error, isNoIcon, ...props }: PasswordInputProps,
    ref: Ref<HTMLInputElement>,
  ) => {
    const [isPassShow, setPassShow] = useState(false);
    const disableToggle = (props.value?.toString().length ?? 0) <= 0;

    return (
      <div className="form-icon-container">
        <input
          ref={ref}
          className={cn(
            'form-control form-password custom-padding-right',
            !isNoIcon ? 'form-icon-input' : '',
            error ? 'is-invalid' : '',
            props.className,
          )}
          type={isPassShow ? 'text' : 'password'}
          {...props}
        />
        {!isNoIcon ? (
          <Icons.FaKey
            className="text-900 fs--1 form-icon"
            width="12"
            height="12"
          />
        ) : null}

        <button
          type="button"
          className="btn btn-icon password-button"
          disabled={disableToggle}
          onClick={() => setPassShow((prev) => !prev)}
        >
          {isPassShow ? <Icons.FiEyeOff /> : <Icons.FiEye />}
        </button>
      </div>
    );
  },
);

export { PasswordInput };
