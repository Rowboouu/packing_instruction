import { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Template } from '@/features/templates';
import { CustomerTemplate } from '..';
import { CustomerTemplateEditButton } from './customer-template-edit-button';

export const custTempTableColumns: ColumnDef<CustomerTemplate>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer Name" />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return (
        <h6 className="mb-0 ms-3 fw-semi-bold text-capitalize text-primary">
          {name}
        </h6>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: 'template',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Template" />
    ),
    cell: ({ row }) => {
      const template = row.getValue('template') as Omit<Template, 'fileData'>;
      return (
        <span className="fw-semi-bold text-capitalize">{template.name}</span>
      );
    },
  },
  {
    id: 'action',
    header: () => <span></span>,
    cell: ({ row }) => {
      const original = row.original;

      return (
        <div className="d-flex align-items-center text-900 text-hover-1000">
          <CustomerTemplateEditButton item={original} />
        </div>
      );
    },
  },
];
