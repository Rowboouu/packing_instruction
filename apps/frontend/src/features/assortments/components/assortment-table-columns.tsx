import { ColumnDef } from '@tanstack/react-table';
// import { NavLink } from 'react-router-dom';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
// import { Badge } from '@/components/ui/badge';
// import { cn } from '@/lib/utils';
// import { getStatusVariant } from '@/utils/getStatusVariant';
// import { getUploadStatus } from '@/utils/getUploadStatus';
import { Assortment } from '..';

export const assortmentTableColumns: ColumnDef<Assortment>[] = [
  {
    accessorKey: 'customerItemNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CUSTOMER ITEM NUMBER" />
    ),
    cell: ({ row }) => {
      //const original = row.original;

      const name = row.getValue('customerItemNo') as string;
      return (
        <div className='px-2 font-bold text-blue-600'>{name}</div>
      );
    },
    // enableHiding: false,
    // enableSorting: false,
  },
  {
    accessorKey: 'itemNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ASSORTMENT NUMBER" />
    ),
    cell: ({ row }) => {
      const itemNo = row.getValue('itemNo') as string;
      return <>{itemNo}</>;
    },
    // enableHiding: false,
    // enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DESCRIPTION" />
    ),
    cell: ({ row }) => {
      const po = row.getValue('name') as string;
      return <>{po}</>;
    },
    // enableHiding: false,
    // enableSorting: false,
  }
];
