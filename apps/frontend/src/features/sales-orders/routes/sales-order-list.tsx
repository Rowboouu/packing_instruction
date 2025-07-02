import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounceValue } from 'usehooks-ts';

import { DataTable } from '@/components/data-table/data-table';
import PageHeader from '@/components/page-header';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';
import {
  SaleOrderTablePagination,
  salesOrderTableColumns,
  useGetInfiniteSalesOrder,
} from '..';

export function SalesOrders() {
  const { t } = useTranslation();
  const { params, setParams } = useTypedSearchParams();

  const [keyword] = useDebounceValue(params.keyword, 500);

  const { data, isFetchingNextPage, isLoading, hasNextPage, hasPreviousPage } =
    useGetInfiniteSalesOrder({
      keyword: keyword,
      limit: params.per_page,
      page: params.page,
    });

  const { items, pageCount } = React.useMemo(() => {
    const items = data?.pages.flatMap((page) => page.items) ?? [];
    const pageCount = data?.pages?.[0]?.totalPages;
    return { items, pageCount };
  }, [data]);

  return (
    <>
      <PageHeader>Sales Orders</PageHeader>
      <div id="sales-order">
        <DataTable
          data={items}
          columns={salesOrderTableColumns}
          isLoading={isLoading || isFetchingNextPage}
          searchPlaceHolder={t('keyPlaceholder_search')}
          enablePagination={false}
          pagination={{
            pageIndex: 0,
            pageSize: params.per_page,
          }}
          customPagination={
            <SaleOrderTablePagination
              searchParams={{ params, setParams }}
              pageCount={pageCount}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
            />
          }
        />
      </div>
    </>
  );
}
