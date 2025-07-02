import { ColumnDef } from '@tanstack/react-table';
import { Dropdown } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import { ConditionalShell } from '@/components/conditional-shell';
import {
  CustomDropDown,
  DropdownEllipsisToggle,
} from '@/components/custom-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Icons } from '@/components/icons';
import { QUERY_KEYS } from '@/constant/query-key';
import { FileData } from '@/features/files';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Template, TemplateActivateButton, TemplateDeactivateButton } from '..';

export const templateTableColumns: ColumnDef<Template>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const original = row.original;
      const id = original._id;

      const name = row.getValue('name') as string;
      return (
        <NavLink
          className="d-flex align-items-center text-900 text-hover-1000"
          to={`template/${id}`}
        >
          <h6 className="mb-0 ms-3 fw-semi-bold text-capitalize text-primary">
            {name}
          </h6>
        </NavLink>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => {
      const code = row.getValue('code') as string;
      return <span className="fw-semi-bold">{code}</span>;
    },
  },
  {
    accessorKey: 'fileData',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Template" />
    ),
    cell: ({ row }) => {
      const fileData = row.getValue('fileData') as FileData;
      if (!fileData) return <></>;
      return (
        <a target="_blank" href={`/api/files/static/${fileData.filename}`}>
          <Icons.FileAlt />
          <span className="fw-semi-bold ms-2">{fileData.originalname}</span>
        </a>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      const status = isActive ? 'Active' : 'Deactived';

      return (
        <span
          className={cn(
            'fw-semi-bold',
            isActive ? 'text-success' : 'text-danger',
          )}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: 'action',
    header: () => <span></span>,
    cell: ({ row }) => {
      const original = row.original;
      const id = original._id;
      const queryClient = useQueryClient();

      function handleUserClick() {
        queryClient.setQueryData([QUERY_KEYS.TEMPLATES, id], original);
      }

      return (
        <Dropdown as={CustomDropDown}>
          <Dropdown.Toggle as={DropdownEllipsisToggle} />
          <Dropdown.Menu className="dropdown-menu dropdown-menu-end py-2">
            {/* <Dropdown.Item
              as={NavLink}
              to={`/users/user/${userId}/${VIEW_TYPE.VIEW}`}
              onClick={handleUserClick}
            >
              View
            </Dropdown.Item>*/}
            <Dropdown.Item
              className="border-bottom"
              as={NavLink}
              to={`template/${id}`}
              onClick={handleUserClick}
            >
              Edit
            </Dropdown.Item>
            <ConditionalShell condition={original.isActive}>
              <Dropdown.Item as={TemplateDeactivateButton} template={original}>
                Deactive
              </Dropdown.Item>
            </ConditionalShell>
            <ConditionalShell condition={!original.isActive}>
              <Dropdown.Item as={TemplateActivateButton} template={original} />
            </ConditionalShell>
          </Dropdown.Menu>
        </Dropdown>
      );
    },
  },
];
