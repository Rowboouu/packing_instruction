import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PAGE_SIZE } from '@/constant';
import { Table } from '@tanstack/react-table';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const hasItem = table.getPageCount() > 0;

  return (
    <div className="row align-items-center justify-content-between py-2 pe-0 fs--1">
      <div className="col-auto d-flex align-items-center">
        {hasItem ? (
          <p
            className="mb-0 d-none d-sm-block me-3 fw-semi-bold text-900"
            data-list-info="data-list-info"
          >
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </p>
        ) : (
          <></>
        )}
      </div>
      <div className="col-auto d-flex pagination">
        <div className="col-auto d-flex align-items-center">
          <p className="text-sm font-medium col-6 p-0 m-0">Rows per page</p>
          <select
            className="form-select form-select-sm col-6"
            value={`${table.getState().pagination.pageSize}`}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            style={{ height: '40px', width: '90px' }}
            disabled={!hasItem}
          >
            {PAGE_SIZE.map((pageSize) => (
              <option key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="px-2"></div>
        <Button
          className="mx-1"
          variant="soft-primary"
          size="icon"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <Icons.FiChevronsLeft height="24px" />
        </Button>
        <Button
          className="mx-1"
          variant="soft-primary"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <Icons.FiChevronLeft />
        </Button>
        <Button
          className="mx-1"
          variant="soft-primary"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <Icons.FiChevronRight />
        </Button>
        <Button
          className="mx-1"
          variant="soft-primary"
          size="icon"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <Icons.FiChevronsRight />
        </Button>
      </div>
    </div>
  );
}
