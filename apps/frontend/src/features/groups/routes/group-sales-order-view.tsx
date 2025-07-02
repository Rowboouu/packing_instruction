import { Breadcrumbs } from '@/components/breadcrumbts';
import PageHeader from '@/components/page-header';
import {
  AssortmentDataView,
  useGetInfiniteAssortment,
} from '@/features/assortments';
import { useGetCustomer } from '@/features/customers';
import { getSalesOrderQuery, useGetSalesOrder } from '@/features/sales-orders';
import useGetInitialData from '@/hooks/useGetInititalData';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';
import { useParams } from 'react-router-dom';
import { useDebounceValue } from 'usehooks-ts';
import { getGroupQuery, useGetGroup } from '..';

export function GroupSalesOrderView() {
  const { params: searchParams } = useTypedSearchParams();
  const params = useParams();
  const groupId = (params?.groupId as string) ?? '';
  const salesOrderId = (params?.salesOrderId as string) ?? '';

  const groupQuery = getGroupQuery(groupId);
  const initialGroupData = useGetInitialData(groupQuery);

  const { data: group } = useGetGroup(groupId, {
    initialData: initialGroupData,
  });

  const salesOrderQuery = getSalesOrderQuery(salesOrderId);
  const initialSalesOrderData = useGetInitialData(salesOrderQuery);
  const { data: salesOrder, isLoading } = useGetSalesOrder(salesOrderId, {
    initialData: initialSalesOrderData,
  });

  const { data: customer } = useGetCustomer(salesOrder?.partnerId ?? 0, {
    enabled: !!salesOrder,
  });

  console.log(salesOrder?.orderId);

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
          { to: `/groups/${groupId}`, label: group?.name },
          { to: '#', label: salesOrder?.name, active: true },
        ]}
      />
      <PageHeader isLoading={isLoading}>
        {salesOrder?.name} - {customer?.name}
      </PageHeader>

      <AssortmentDataView dataQuery={dataQuery} />
    </>
  );
}
