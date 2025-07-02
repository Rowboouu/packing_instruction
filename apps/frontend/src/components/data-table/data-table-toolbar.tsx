import { Table } from '@tanstack/react-table';

import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { STATUS_OPTIONS } from '@/constant';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConditionalShell } from '../conditional-shell';
import { DataTableFacetedFilter } from './data-table-faceted-filter';

export interface ToolBarProps {
  position: 'left' | 'center' | 'right';
  component: React.ReactNode;
}
interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchPlaceHolder?: string;
  toolBars?: ToolBarProps[];
}

export const statuses = STATUS_OPTIONS.map((status) => ({
  value: status,
  label: status,
}));

export function DataTableToolbar<TData>({
  table,
  searchPlaceHolder,
  toolBars,
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation();
  const globalFilter = table.getState().globalFilter;
  const leftToolBars = toolBars?.filter(
    (toolbar) => toolbar.position === 'left',
  );

  const centerToolBars = toolBars?.filter(
    (toolbar) => toolbar.position === 'center',
  );
  const rightToolBars = toolBars?.filter(
    (toolbar) => toolbar.position === 'right',
  );

  const columns = table.getAllColumns();
  const hasStatusColumn = columns.some((column) => column.id === 'status');

  return (
    <div className="row align-items-center justify-content-between g-3 mb-4">
      <div
        className="col col-auto d-flex align-items-center"
        style={{ gap: '4px' }}
      >
        <div className="search-box">
          <div
            className="position-relative"
            data-bs-toggle="search"
            data-bs-display="static"
          >
            <Input
              className="form-control search-input search"
              type="search"
              aria-label="Search"
              placeholder={searchPlaceHolder ?? t('keyPlaceholder_search')}
              value={globalFilter ?? ''}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                table.setGlobalFilter(event.target.value)
              }
            />
            <Icons.FiSearch
              className="search-box-icon"
              width="13px"
              height="13px"
            />
          </div>
        </div>
        {hasStatusColumn && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={statuses}
          />
        )}
        {leftToolBars?.map((toolbar, index) => (
          <React.Fragment key={index}>{toolbar.component}</React.Fragment>
        ))}
      </div>
      <ConditionalShell
        condition={centerToolBars && centerToolBars?.length >= 1}
      >
        <div className="col col-auto">
          <div className="d-flex align-items-center" style={{ gap: '4px' }}>
            {centerToolBars?.map((toolbar, index) => (
              <React.Fragment key={index}>{toolbar.component}</React.Fragment>
            ))}
          </div>
        </div>
      </ConditionalShell>
      <div className="col col-auto">
        <ConditionalShell
          condition={rightToolBars && rightToolBars?.length >= 1}
        >
          <div className="d-flex align-items-center" style={{ gap: '4px' }}>
            {rightToolBars?.map((toolbar, index) => (
              <React.Fragment key={index}>{toolbar.component}</React.Fragment>
            ))}
          </div>
        </ConditionalShell>
      </div>
    </div>
  );
}
