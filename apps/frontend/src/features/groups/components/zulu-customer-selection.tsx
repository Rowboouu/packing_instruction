import { FieldError } from 'react-hook-form';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Customer } from '@/features/customers/types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ZuluCustomerSelectionProps {
  onChange?: (selectedItems: Customer[]) => void;
  value?: Customer[];
  error?: FieldError;
}

export function ZuluCustomerSelection({
  value,
  onChange,
  error,
}: ZuluCustomerSelectionProps) {
  const { t } = useTranslation();
  return (
    <div className="form-icon-container">
      <div
        className={cn('form-control', error && 'is-invalid')}
        style={{ minHeight: '3rem' }}
      >
        {value && value.length > 0 ? (
          value.map((item) => (
            <Badge
              key={item.id}
              className="mx-1 my-1"
              variant={'phoenix-secondary'}
            >
              <span className="badge-label"> {item.name}</span>
              <Icons.X
                className="ms-1 cursor-pointer text-danger"
                width={16}
                height={16}
                onClick={() => {
                  if (onChange) {
                    onChange(value.filter((i) => i.id !== item.id));
                  }
                }}
              />
            </Badge>
          ))
        ) : (
          <span
            className="badge-label"
            style={{
              color: 'var(--phoenix-gray-400)',
            }}
          >
            {t('keyPlaceholder_customerSelect')}
          </span>
        )}
      </div>
    </div>
  );
}
