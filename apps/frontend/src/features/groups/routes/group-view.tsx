import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { DataTable } from '@/components/data-table/data-table';
import PageHeader from '@/components/page-header';
import { salesOrderTableColumns } from '@/features/sales-orders';
import useGetInitialData from '@/hooks/useGetInititalData';
import { getGroupQuery, useGetGroup } from '..';
import { EditButtonGroup } from '../components/edit-group-button';

export function GroupView() {
  const params = useParams();
  const { t } = useTranslation();

  const groupId = (params?.groupId as string) ?? '';
  const query = getGroupQuery(groupId);
  const initialData = useGetInitialData(query);

  const { data, isLoading } = useGetGroup(groupId, {
    initialData,
  });

  const items = data?.salesOrders ?? [];

  return (
    <>
      <PageHeader isLoading={isLoading}>{data?.name}</PageHeader>

      <div id="grouped-sales-order">
        <DataTable
          data={items}
          columns={salesOrderTableColumns}
          isLoading={isLoading}
          searchPlaceHolder={t('keyPlaceholder_search')}
          toolbars={[
            {
              position: 'right',
              component: <>{data && <EditButtonGroup item={data} />}</>,
            },
          ]}
        />
      </div>
    </>
  );
}
