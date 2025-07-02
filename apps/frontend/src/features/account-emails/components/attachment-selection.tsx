import { Icons } from '@/components/icons';
import { LoadMoreButton } from '@/components/load-more-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useGetInfiniteAssortment } from '@/features/assortments';
import { cn } from '@/lib/utils';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDebounceValue } from 'usehooks-ts';
import { useAttachmentStore } from '..';

export function AttachmentSelection() {
  const { t } = useTranslation();
  const { selected, toggleItemSelection } = useAttachmentStore();

  const [filter, setFilter] = React.useState<string | undefined>();

  const [keyword] = useDebounceValue(filter, 500);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetInfiniteAssortment({
      keyword: keyword,
    });

  const allItems = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  return (
    <>
      <div className="row pb-2">
        <label className="col-form-label">
          <Trans i18nKey={'keyField_items'} />
        </label>
        <div className="form-icon-container">
          <div className={cn('form-control')} style={{ minHeight: '3rem' }}>
            {selected && selected.length > 0 ? (
              selected.map((item) => (
                <Badge
                  key={item._id}
                  className="mx-1 my-1"
                  variant={'phoenix-secondary'}
                >
                  <span className="badge-label">
                    {item.customerItemNo} - {item.itemNo}
                  </span>
                  <Icons.X
                    className="ms-1 cursor-pointer text-danger"
                    width={16}
                    height={16}
                    onClick={() =>
                      toggleItemSelection({ ...item, item_size: 0 })
                    }
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
                <Trans i18nKey="keyPlaceholder_selectItem" />
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="pb-2">
        <Input
          type="search"
          placeholder={t('keyPlaceholder_search')}
          leftIcon="FiSearch"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <ul
        className="overflow-auto scrollbar list-group list-group-flush"
        style={{ height: '10rem' }}
      >
        {allItems.map((item) => (
          <li className="list-group-item">
            <input
              className="form-check-input"
              type="checkbox"
              onChange={() => toggleItemSelection({ ...item, item_size: 0 })}
              checked={selected?.some((val) => val._id === item._id)}
            />
            <span className="ms-2">
              {item.customerItemNo} - {item.itemNo}
            </span>
          </li>
        ))}
        <li>
          <LoadMoreButton
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage || isLoading}
          />
        </li>
      </ul>
    </>
  );
}
