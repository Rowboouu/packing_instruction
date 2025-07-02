import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { DEFAULT_PAGE, PAGE_SIZE } from '@/constant';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';

export interface SaleOrderTablePaginationProps {
  searchParams: ReturnType<typeof useTypedSearchParams>;
  pageCount?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export function SaleOrderTablePagination({
  searchParams: { params, setParams },
  pageCount = 1,
  hasNextPage,
  hasPreviousPage,
}: SaleOrderTablePaginationProps) {
  return (
    <div className="row align-items-center justify-content-between py-2 pe-0 fs--1">
      <div className="col-auto d-flex align-items-center">
        <p
          className="mb-0 d-none d-sm-block me-3 fw-semi-bold text-900"
          data-list-info="data-list-info"
        >
          Page {params.page} of {pageCount}
        </p>
      </div>
      <div className="col-auto d-flex pagination">
        <div className="col-auto d-flex align-items-center">
          <p className="text-sm font-medium col-6 p-0 m-0">Rows per page</p>
          <select
            className="form-select form-select-sm col-6"
            value={`${params.per_page}`}
            onChange={(e) => {
              setParams({
                page: DEFAULT_PAGE,
                per_page: Number(e.target.value),
              });
            }}
            style={{ height: '40px', width: '90px' }}
            // disabled={!hasItem}
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
          onClick={() => setParams({ page: DEFAULT_PAGE })}
          disabled={params.page <= DEFAULT_PAGE}
        >
          <Icons.FiChevronsLeft height="24px" />
        </Button>
        <Button
          className="mx-1"
          variant="soft-primary"
          size="icon"
          onClick={() => {
            setParams({ page: params.page - 1 });
          }}
          disabled={!hasPreviousPage}
        >
          <Icons.FiChevronLeft />
        </Button>
        <Button
          className="mx-1"
          variant="soft-primary"
          size="icon"
          onClick={() => {
            setParams({ page: params.page + 1 });
          }}
          disabled={!hasNextPage}
        >
          <Icons.FiChevronRight />
        </Button>
        <Button
          className="mx-1"
          variant="soft-primary"
          size="icon"
          onClick={() => setParams({ page: pageCount })}
          disabled={params.page >= pageCount}
        >
          <Icons.FiChevronsRight />
        </Button>
      </div>
    </div>
  );
}
