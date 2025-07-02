import { Table, flexRender } from '@tanstack/react-table';
import { TableCell, TableFooter, TableRow } from '../ui/table';

interface DataTableFooterProps<TData> {
  table: Table<TData>;
}

export function DataTableFooter<TData>({ table }: DataTableFooterProps<TData>) {
  return (
    <TableFooter className="border-top border-bottom border-dark">
      {table.getFooterGroups().map((footerGroup) => (
        <TableRow key={footerGroup.id}>
          {footerGroup.headers.map((header) => (
            <TableCell key={header.id} colSpan={header.colSpan}>
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.footer,
                    header.getContext(),
                  )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableFooter>
  );
}
