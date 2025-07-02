import { STATUS_OPTIONS, StatusType } from '@/constant';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';
import { cn } from '@/lib/utils';

export function StatusFilter() {
  const { params, setParams } = useTypedSearchParams();

  function handleStatusChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParams({ status: e.target.id as StatusType });
  }

  return (
    <div className="d-flex flex-row">
      {STATUS_OPTIONS.map((item, index) => {
        const isCheck = params.status === item;
        return (
          <div
            className="custom-control custom-radio custom-control-inline d-flex align-items-center pe-2"
            key={item + index}
          >
            <input
              id={item}
              type="radio"
              name="productStatus"
              className="custom-control-input d-none"
              checked={isCheck}
              onChange={handleStatusChange}
            />
            <label
              className={cn(
                'custom-control-label px-2 text-capitalize text-hover-1000 fw-semi-bold',
                isCheck ? 'fw-black' : 'cursor-pointer text-primary',
              )}
              htmlFor={item}
            >
              {item}
            </label>
          </div>
        );
      })}
    </div>
  );
}
