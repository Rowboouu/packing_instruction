import React from 'react';
import { useDebounceValue } from 'usehooks-ts';

import { LoadMoreButton } from '@/components/load-more-button';
import { Input } from '@/components/ui/input';
import { Customer, useGetInfiniteZuluCustomers } from '@/features/customers';
import { useTranslation } from 'react-i18next';

interface ZuluCustomerFilterProps {
  onChange?: (selectedItems: Customer[]) => void;
  value?: Customer[];
}

export function ZuluCustomerFilter({
  value,
  onChange,
}: ZuluCustomerFilterProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState<string | undefined>('');
  const [keyword] = useDebounceValue(filter, 500);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetInfiniteZuluCustomers({
      keyword,
    });
  const items = data?.pages.flatMap((page) => page.items);

  function handleCheck(item: Customer) {
    const isSelected = value?.some((val) => val.id === item.id);
    if (isSelected) {
      const updatedValue = value?.filter((val) => val.id !== item.id);
      onChange?.(updatedValue ?? []);
    } else {
      onChange?.([...(value ?? []), item]);
    }
  }

  return (
    <>
      <div className="pb-2">
        <Input
          type="search"
          placeholder={t('keyPlaceholder_search')}
          leftIcon="FiSearch"
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
        />
      </div>
      <ul
        className="overflow-auto scrollbar list-group list-group-flush"
        style={{ height: '10rem' }}
      >
        {items?.map((item) => {
          return (
            <li key={item.id} className="list-group-item">
              <input
                className="form-check-input"
                type="checkbox"
                onChange={() => handleCheck(item)}
                checked={value?.some((val) => val.id === item.id)}
              />
              <span className="ms-2">{item.name}</span>
            </li>
          );
        })}
        <LoadMoreButton
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </ul>
    </>
  );
}
