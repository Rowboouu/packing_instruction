import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, StatusType } from '@/constant';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';
import { DataTableFooter } from './data-table-footer';
import { DataTablePagination } from './data-table-pagination';
import { DataTableSkeleton } from './data-table-skeleton';
import { DataTableToolbar, ToolBarProps } from './data-table-toolbar';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchPlaceHolder?: string;
  toolbars?: ToolBarProps[];
  enableToolbar?: boolean;
  enablePagination?: boolean;
  pagination?: PaginationState;
  customPagination?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  searchPlaceHolder,
  toolbars,
  enableToolbar,
  enablePagination,
  customPagination,
  pagination,
}: DataTableProps<TData, TValue>) {
  const navigate = useNavigate();
  const { params, setParams } = useTypedSearchParams();

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    params.status !== 'all' ? [{ id: 'status', value: params.status }] : [],
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [defaultPagination, setPagination] = React.useState<PaginationState>({
    pageIndex: DEFAULT_PAGE - 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const [keyword, setKeyword] = React.useState(params.keyword);

  const globalFilter = React.useMemo(() => keyword, [keyword]);

  React.useEffect(() => {
    setParams({ keyword: keyword });
  }, [keyword]);

  React.useEffect(() => {
    const newStatus = columnFilters[0]?.value as StatusType | undefined;
    setParams({ status: newStatus });
  }, [columnFilters]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      rowSelection,
      globalFilter,
      pagination: pagination ?? defaultPagination,
    },
    enableRowSelection: true,
    onGlobalFilterChange: setKeyword,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const hasContainsFooter = table
    .getFooterGroups()
    .flat()
    .some((item) =>
      item.headers.some((header) => header.column.columnDef.footer),
    );

  return (
    <>
      {enableToolbar !== false && (
        <DataTableToolbar
          table={table}
          searchPlaceHolder={searchPlaceHolder}
          toolBars={toolbars}
        />
      )}

      <div className="mb-9 bg-white border-[#cbd0dd] border-y-1 mt-2 position-relative top-1">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => {
                    const id = (row.original as any)._id || (row.original as any).id;
                    if (id) navigate(`/assortments/${id}`);
                  }}
                  style={{ cursor: 'pointer' }}
                  className="text-900 text-hover-1000"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <>
                {isLoading ? (
                  <DataTableSkeleton columns={columns} />
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="display-1 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
          {hasContainsFooter && <DataTableFooter table={table} />}
        </Table>

        {customPagination}
        {enablePagination !== false && <DataTablePagination table={table} />}
      </div>
    </>
  );
}
