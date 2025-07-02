import { DEFAULT_STATUS, STATUS_OPTIONS, StatusType } from '@/constant';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';
import { cn } from '@/lib/utils';

interface AssortmentStatusFilterProps {
  statusCounts: Record<string, number>;
}

export function AssortmentStatusFilter({
  //statusCounts,
}: AssortmentStatusFilterProps) {
  const { params, setParams } = useTypedSearchParams();

  function handleStatusChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newStatus = e.target.id as StatusType;
    setParams({ status: newStatus === DEFAULT_STATUS ? undefined : newStatus });
  }

  return (
    <div className="d-flex flex-row">
      {STATUS_OPTIONS.map((status, index) => {
        const isCheck = params.status === status;
        return (
          <div
            className="custom-control custom-radio custom-control-inline d-flex align-items-center pe-2"
            key={status + index}
          >
            <input
              id={status}
              type="radio"
              name="productStatus"
              className="custom-control-input d-none"
              checked={isCheck}
              onChange={handleStatusChange}
            />
            <label
              className={cn(
                'custom-control-label px-2 text-capitalize text-hover-1000 fw-semi-bold',
                !isCheck && 'cursor-pointer',
              )}
              htmlFor={status}
            >
              {/* <span className={cn(isCheck ? 'text-secondary' : 'text-primary')}>
                {status}
              </span>
              <span>({statusCounts[status] || '0'})</span> */}
            </label>
          </div>
        );
      })}
    </div>
  );
}
