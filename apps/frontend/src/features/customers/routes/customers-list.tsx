import { NavLink } from 'react-router-dom';

import { DataTable } from '@/components/data-table/data-table';
import { Icons } from '@/components/icons';
import PageHeader from '@/components/page-header';
import { useTranslation } from 'react-i18next';
import { custTempTableColumns, useGetCustomerTemplate } from '..';

export function Customers() {
  const { t } = useTranslation();

  const { data, isLoading } = useGetCustomerTemplate();

  return (
    <>
      <PageHeader>{t('keyNavigation_customers')}</PageHeader>

      <div id="customer-templates">
        <DataTable
          data={data ?? []}
          columns={custTempTableColumns}
          isLoading={isLoading}
          searchPlaceHolder="Search customer..."
          toolbars={[
            {
              position: 'right',
              component: (
                <NavLink className="btn btn-primary btn-sm" to="new">
                  <Icons.Plus />
                  <span className="ms-2">Add customer template</span>
                </NavLink>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
