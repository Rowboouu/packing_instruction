import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Dropdown } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import { ConditionalShell } from '@/components/conditional-shell';
import { AvatarContainer } from '@/components/container/avatar-container';
import {
  CustomDropDown,
  DropdownEllipsisToggle,
} from '@/components/custom-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { VIEW_TYPE } from '@/constant';
import { QUERY_KEYS } from '@/constant/query-key';
import { cn } from '@/lib/utils';
import { User, UserActivateButton, UserDeactivateButton } from '..';

export const userTableColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const original = row.original;
      const userId = original._id;

      const name = row.getValue('name') as string;
      return (
        <NavLink
          className="d-flex align-items-center text-900 text-hover-1000"
          to={`/users/user/${userId}/${VIEW_TYPE.VIEW}`}
        >
          <div className="avatar avatar-m">
            <AvatarContainer name={name} />
          </div>
          <h6 className="mb-0 ms-3 fw-semi-bold text-capitalize">{name}</h6>
        </NavLink>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string;
      return (
        <span className="">
          <a className="fw-semi-bold" href={`mailto:${email}`}>
            {email}
          </a>
        </span>
      );
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return <span className="fw-semi-bold text-capitalize">{role}</span>;
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
      const queryClient = useQueryClient();
      const original = row.original;
      const userId = original._id;

      function handleUserClick() {
        queryClient.setQueryData([QUERY_KEYS.USERS, userId], original);
      }

      return (
        <Dropdown as={CustomDropDown}>
          <Dropdown.Toggle as={DropdownEllipsisToggle} />
          <Dropdown.Menu className="dropdown-menu dropdown-menu-end py-2">
            <Dropdown.Item
              as={NavLink}
              to={`/users/user/${userId}/${VIEW_TYPE.VIEW}`}
              onClick={handleUserClick}
            >
              View
            </Dropdown.Item>
            <Dropdown.Item
              className="border-top"
              as={NavLink}
              to={`/users/user/${userId}/${VIEW_TYPE.EDIT}`}
              onClick={handleUserClick}
            >
              Edit
            </Dropdown.Item>
            <ConditionalShell condition={original.isActive}>
              <Dropdown.Item as={UserDeactivateButton} user={original}>
                Deactive
              </Dropdown.Item>
            </ConditionalShell>
            <ConditionalShell condition={!original.isActive}>
              <Dropdown.Item as={UserActivateButton} user={original} />
            </ConditionalShell>
          </Dropdown.Menu>
        </Dropdown>
      );
    },
  },
];
