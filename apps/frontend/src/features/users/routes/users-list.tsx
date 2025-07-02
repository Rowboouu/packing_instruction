import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { DataTable } from '@/components/data-table/data-table';
import { Icons } from '@/components/icons';
import PageHeader from '@/components/page-header';
import { useGetUsers, userTableColumns } from '..';

export function UsersList() {
  const { t } = useTranslation();

  const { data, isLoading } = useGetUsers();

  return (
    <>
      <PageHeader>{t('keyNavigation_users')}</PageHeader>

      <div id="users">
        <DataTable
          data={data ?? []}
          columns={userTableColumns}
          isLoading={isLoading}
          searchPlaceHolder={t('keyPlaceholder_search')}
          toolbars={[
            {
              position: 'right',
              component: (
                <NavLink className="btn btn-primary btn-sm" to="new">
                  <Icons.Plus />
                  <span className="ms-2">Add user</span>
                </NavLink>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
