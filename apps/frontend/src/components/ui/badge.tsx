import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva('badge', {
  variants: {
    variant: {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      success: 'bg-success',
      danger: 'bg-danger',
      warning: 'bg-warning',
      info: 'bg-info',
      link: 'bg-link',
      'phoenix-primary': 'badge-phoenix badge-phoenix-primary',
      'phoenix-secondary': 'badge-phoenix badge-phoenix-secondary',
      'phoenix-success': 'badge-phoenix badge-phoenix-success',
      'phoenix-info': 'badge-phoenix badge-phoenix-info',
      'phoenix-warning': 'badge-phoenix badge-phoenix-warning',
      'phoenix-danger': 'badge-phoenix badge-phoenix-danger',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
