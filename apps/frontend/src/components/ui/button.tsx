import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva('btn', {
  variants: {
    variant: {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      success: 'btn-success',
      danger: 'btn-danger',
      warning: 'btn-warning',
      info: 'btn-info',
      link: 'btn-link',
      'phoenix-primary': 'btn-phoenix-primary',
      'phoenix-secondary': 'btn-phoenix-secondary',
      'phoenix-success': 'btn-phoenix-success',
      'phoenix-danger': 'btn-phoenix-danger',
      'phoenix-warning': 'btn-phoenix-warning',
      'phoenix-info': 'btn-phoenix-info',
      'soft-primary': 'btn-soft-primary',
      'soft-secondary': 'btn-soft-secondary',
      'soft-success': 'btn-soft-success',
      'soft-danger': 'btn-soft-danger',
      'soft-warning': 'btn-soft-warning',
      'soft-info': 'btn-soft-info',
      'outline-primary': 'btn-outline-primary',
      'outline-secondary': 'btn-outline-secondary',
      'outline-success': 'btn-outline-success',
      'outline-danger': 'btn-outline-danger',
      'outline-warning': 'btn-outline-warning',
      'outline-info': 'btn-outline-info',
    },
    size: {
      default: '',
      sm: 'btn-sm',
      lg: 'btn-lg',
      icon: 'btn-icon',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'default',
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
