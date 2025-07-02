import { Badge } from '@/components/ui/badge';

type Variant = React.ComponentProps<typeof Badge>['variant'];
export function getStatusVariant(
  status?: string,
  type?: 'SO' | 'ASA',
): Variant {
  switch (status) {
    case 'todo':
      return 'phoenix-danger';
    case 'ongoing':
      return 'phoenix-primary';
    case 'completed':
      return type === 'SO' ? 'phoenix-success' : 'info';
    case 'approved':
      return 'phoenix-success';
    default:
      return 'phoenix-danger';
  }
}
