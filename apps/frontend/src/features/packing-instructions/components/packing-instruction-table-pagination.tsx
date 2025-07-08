import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { DEFAULT_PAGE, PAGE_SIZE } from '@/constant';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';

export interface PackingInstructionTablePaginationProps {
  searchParams: ReturnType<typeof useTypedSearchParams>;
  pageCount?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  totalItems?: number;
  currentPage?: number;
  itemsPerPage?: number;
}

export function PackingInstructionTablePagination({
  searchParams: { params, setParams },
  pageCount = 1,
  hasNextPage,
  hasPreviousPage,
  totalItems = 0,
  currentPage = 1,
  itemsPerPage = 10,
}: PackingInstructionTablePaginationProps) {
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="row align-items-center justify-content-between p-2 pe-0 fs--1">
      <div className="col-auto d-flex align-items-center">
        <p className="mb-0 d-none d-sm-block me-3 fw-semi-bold text-900">
          Showing {startIndex}-{endIndex} of {totalItems} assortments (Page {currentPage} of {pageCount})
        </p>
      </div>
      
      <div className="col-auto d-flex pagination">
        <div className="col-auto d-flex align-items-center">
          <p className="text-sm font-medium col-6 p-0 m-0">Rows per page</p>
          <select
            className="form-select form-select-sm col-6"
            value={`${params.per_page || itemsPerPage}`}
            onChange={(e) => {
              setParams({
                page: DEFAULT_PAGE,
                per_page: Number(e.target.value),
              });
            }}
            style={{ height: '40px', width: '90px' }}
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
          disabled={(params.page || currentPage) <= DEFAULT_PAGE}
        >
          <Icons.FiChevronsLeft height="24px" />
        </Button>
        
        <Button
          className="mx-1"
          variant="soft-primary"
          size="icon"
          onClick={() => {
            setParams({ page: (params.page || currentPage) - 1 });
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
            setParams({ page: (params.page || currentPage) + 1 });
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
          disabled={(params.page || currentPage) >= pageCount}
        >
          <Icons.FiChevronsRight />
        </Button>
      </div>
    </div>
  );
}