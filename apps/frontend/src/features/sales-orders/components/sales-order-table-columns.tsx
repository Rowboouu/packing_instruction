import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { NavLink } from 'react-router-dom';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { getStatusVariant } from '@/utils/getStatusVariant';
import { ProgressBar } from 'react-bootstrap';
import { SalesOrder } from '..';

export const salesOrderTableColumns: ColumnDef<SalesOrder>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sales Order #" />
    ),
    cell: ({ row }) => {
      const original = row.original;

      const name = row.getValue('name') as string;
      return (
        <NavLink className="d-flex align-items-center" to={`${original._id}`}>
          <h6 className="mb-0 ms-3 fw-semi-bold text-capitalize text-primary">
            {name}
          </h6>
        </NavLink>
      );
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'customerPoNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer PO #" />
    ),
    cell: ({ row }) => {
      const po = row.getValue('customerPoNo') as string;
      return <>{po}</>;
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'etd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ETD" />
    ),
    cell: ({ row }) => {
      const etd = row.getValue('etd') as string | null;
      if (!etd) {
        return <></>;
      }
      const formattedDate = dayjs(etd).format('MMM DD, YYYY');
      return <>{formattedDate}</>;
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'orderLines',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Items" />
    ),
    cell: ({ row }) => {
      const orderLines = row.getValue('orderLines') as Array<number>;
      return <>{orderLines.length}</>;
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'orderItems',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Approved Items" />
    ),
    cell: ({ row }) => {
      const orderLines = row.getValue('orderItems') as Array<any>;
      return <>{orderLines.length}</>;
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: 'notCompletedItems',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Not Complete Items" />
    ),
    cell: ({ row }) => {
      const original = row.original;
      const orderLines = original.orderLines;
      const orderItems = original.orderItems;

      const notCompletedItems = orderLines.length - orderItems.length;

      return <>{notCompletedItems}</>;
    },
    enableHiding: false,
  },
  {
    id: 'progress',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Progress" />
    ),
    cell: ({ row }) => {
      const original = row.original;
      const orderLines = original.orderLines;
      const approvedItems = original.orderItems;

      // const notCompletedItems = orderLines.length - orderItems.length;
      const totalItems = orderLines.length;
      // const completedItems = Math.floor(Math.random() * (totalItems + 1));
      const completedItems = approvedItems.length;
      const percentageCompleted = (completedItems / totalItems) * 100;

      return (
        <>
          {percentageCompleted.toFixed(2)}%
          <ProgressBar
            variant={percentageCompleted === 100 ? 'success' : 'primary'}
            now={percentageCompleted}
          />
        </>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;

      return (
        <Badge
          className="text-capitalize"
          variant={getStatusVariant(status, 'SO')}
        >
          {status}
        </Badge>
      );
    },
    enableHiding: false,
    enableSorting: false,
  },
];
