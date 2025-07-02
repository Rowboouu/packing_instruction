import { Breadcrumbs } from '@/components/breadcrumbts';
import PageHeader from '@/components/page-header';
import {
  AssortmentDataView,
  useGetInfiniteAssortment,
} from '@/features/assortments';
import { useGetCustomer } from '@/features/customers';
import useGetInitialData from '@/hooks/useGetInititalData';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';
import { useParams } from 'react-router-dom';
import { useDebounceValue } from 'usehooks-ts';
import { getSalesOrderQuery, useGetSalesOrder } from '..';

export function SalesOrderView() {
  const { params: searchParams } = useTypedSearchParams();
  const params = useParams();
  const salesOrderId = (params?.salesOrderId as string) ?? '';

  const query = getSalesOrderQuery(salesOrderId);
  const initialData = useGetInitialData(query);
  const { data: salesOrder, isLoading } = useGetSalesOrder(salesOrderId, {
    initialData,
  });

  const { data: customer } = useGetCustomer(salesOrder?.partnerId ?? 0, {
    enabled: !!salesOrder,
  });

  const [keyword] = useDebounceValue(searchParams.keyword, 500);
  const dataQuery = useGetInfiniteAssortment({
    keyword: keyword,
    limit: searchParams.per_page,
    page: searchParams.page,
    status: searchParams.status !== 'all' ? params.status : undefined,
    orderId: salesOrder?.orderId,
  });

  return (
    <>
      <Breadcrumbs
        isLoading={isLoading}
        breadcrumbs={[
          { to: '/sales-orders', label: 'Sales Order' },
          { to: '#', label: salesOrder?.name ?? '', active: true },
        ]}
      />
      <PageHeader isLoading={isLoading}>
        {salesOrder?.name} - {customer?.name}
      </PageHeader>

      <AssortmentDataView dataQuery={dataQuery} />
    </>
  );
}
