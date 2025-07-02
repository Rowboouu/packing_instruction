import { ColumnDef } from '@tanstack/react-table';
import { TableCell, TableRow } from '../ui/table';

interface DataTableSkeletonProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
}

export function DataTableSkeleton<TData, TValue>({
  columns,
}: DataTableSkeletonProps<TData, TValue>) {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <TableRow key={index} className="placeholder-glow">
          {Array.from({ length: columns.length }, (_, columnIndex) => (
            <TableCell key={columnIndex}>
              <span
                className="placeholder w-100 rounded-2"
                style={{ height: '30px' }}
              ></span>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
