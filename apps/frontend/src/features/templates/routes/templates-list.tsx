import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { DataTable } from '@/components/data-table/data-table';
import { Icons } from '@/components/icons';
import PageHeader from '@/components/page-header';
import { templateTableColumns, useGetTemplates } from '..';

export function Templates() {
  const { t } = useTranslation();

  const { data, isLoading } = useGetTemplates();

  return (
    <>
      <PageHeader>{t('keyNavigation_templates')}</PageHeader>

      <div id="templates">
        <DataTable
          data={data ?? []}
          columns={templateTableColumns}
          isLoading={isLoading}
          searchPlaceHolder={t('keyPlaceholder_search')}
          toolbars={[
            {
              position: 'right',
              component: (
                <NavLink className="btn btn-primary btn-sm" to="new">
                  <Icons.Plus />
                  <span className="ms-2">Add template</span>
                </NavLink>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
