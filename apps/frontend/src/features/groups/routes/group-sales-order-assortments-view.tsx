import { Breadcrumbs } from '@/components/breadcrumbts';
import { AssortmentHeader, AssortmentItem } from '@/features/assortments';
import {
  getAssortmentQuery,
  useGetAssortment,
} from '@/features/assortments/api/getAssortment';
import { getSalesOrderQuery, useGetSalesOrder } from '@/features/sales-orders';
import useGetInitialData from '@/hooks/useGetInititalData';
import { useParams } from 'react-router-dom';
import { getGroupQuery, useGetGroup } from '..';

export function GroupSalesOrderAssortmentView() {
  const params = useParams();
  const groupId = (params?.groupId as string) ?? '';
  const salesOrderId = (params?.salesOrderId as string) ?? '';
  const assortmentId = (params?.assortmentId as string) ?? '';

  const groupQuery = getGroupQuery(groupId);
  const initialGroupData = useGetInitialData(groupQuery);
  const { data: group } = useGetGroup(groupId, {
    initialData: initialGroupData,
  });

  const salesOrderQuery = getSalesOrderQuery(salesOrderId);
  const initialSalesOrderData = useGetInitialData(salesOrderQuery);
  const { data: salesOrder } = useGetSalesOrder(salesOrderId, {
    initialData: initialSalesOrderData,
  });

  const assortmentQuery = getAssortmentQuery(assortmentId);
  const initialAssortmentData = useGetInitialData(assortmentQuery);
  const { data: assortment, isLoading } = useGetAssortment(assortmentId, {
    initialData: initialAssortmentData,
  });

  return (
    <>
      <Breadcrumbs
        isLoading={isLoading}
        breadcrumbs={[
          { to: `/groups/${groupId}`, label: group?.name },
          {
            to: `/groups/${groupId}/${salesOrder?._id}`,
            label: salesOrder?.name,
          },
          { to: '#', label: assortment?.customerItemNo, active: true },
        ]}
      />
      <AssortmentHeader assortment={assortment} isLoading={isLoading} />
      {assortment && <AssortmentItem assortment={assortment} />}
    </>
  );
}
