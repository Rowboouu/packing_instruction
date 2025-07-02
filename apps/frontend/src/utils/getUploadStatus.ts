import { Icons } from '@/components/icons';

export function getUploadStatus(status?: string) {
  switch (status) {
    case 'pending':
      return Icons.UUpload;
    case 'in-progress':
      return Icons.USync;
    case 'completed':
      return Icons.UCheck;
    default:
      return Icons.UUpload;
  }
}
