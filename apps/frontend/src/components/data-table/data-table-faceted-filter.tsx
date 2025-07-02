import { DEFAULT_STATUS } from '@/constant';
import { cn } from '@/lib/utils';
import { Column } from '@tanstack/react-table';

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}
export function DataTableFacetedFilter<TData, TValue>({
  column,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValue = (column?.getFilterValue() as string) || DEFAULT_STATUS;

  const totalItems = Array.from(facets?.values() || []).reduce(
    (total, value) => total + value,
    0,
  );

  return (
    <div className="d-flex flex-row">
      {options.map((option, index) => {
        const isCheck = option.value === selectedValue;
        return (
          <div
            className="custom-control custom-radio custom-control-inline d-flex align-items-center pe-2"
            key={option.value + index}
          >
            <input
              id={option.value}
              type="radio"
              name="productStatus"
              className="custom-control-input d-none"
              checked={isCheck}
              onChange={() => {
                const value =
                  option.value !== DEFAULT_STATUS ? option.value : null;
                column?.setFilterValue(value);
              }}
            />
            <label
              className={cn(
                'custom-control-label px-2 text-capitalize text-hover-1000 fw-semi-bold',
                !isCheck && 'cursor-pointer',
              )}
              htmlFor={option.value}
            >
              <span className={cn(isCheck ? 'text-secondary' : 'text-primary')}>
                {option.value}
              </span>
              (
              {option.value === 'all'
                ? totalItems
                : facets?.get(option.value) || '0'}
              )
            </label>
          </div>
        );
      })}
    </div>
  );
}
