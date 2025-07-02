import { cn } from '@/lib/utils';
import React, { Ref, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface SelectOptions {
  value: string;
  label: string;
}

interface ComponentProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: FieldError;
  placeholder?: string;
  isLoading?: boolean;
  options?: SelectOptions[];
}

export const SelectInput: React.FC<ComponentProps> = forwardRef<
  HTMLSelectElement,
  ComponentProps
>(
  (
    { error, placeholder: label, isLoading, options, ...props }: ComponentProps,
    ref: Ref<HTMLSelectElement>,
  ) => {
    return (
      <div className="form-icon-container">
        <select
          ref={ref}
          className={cn('form-select', error ? 'is-invalid' : '')}
          defaultValue=""
          {...props}
        >
          <option value="" disabled>
            {isLoading ? 'Loading...' : label}
          </option>
          {options?.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  },
);
