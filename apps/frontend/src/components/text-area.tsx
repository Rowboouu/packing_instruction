import { cn } from '@/lib/utils';
import { Ref, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    React.AriaAttributes {
  error?: FieldError;
  value?: string | readonly string[] | number | undefined;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, ...props }: TextAreaProps, ref: Ref<HTMLTextAreaElement>) => {
    return (
      <textarea
        className={cn('form-control', error ? 'is-invalid' : '')}
        ref={ref}
        {...props}
      />
    );
  },
);
export { TextArea };
