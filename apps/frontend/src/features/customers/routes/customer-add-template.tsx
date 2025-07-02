import { NavLink } from 'react-router-dom';

import PageHeader from '@/components/page-header';
import { CustomerTemplateAddForm } from '..';

export function CustomerAddTemplate() {
  return (
    <div className="mx-n4 mx-lg-n6 px-6 position-relative">
      <nav className="mb-2" aria-label="breadcrumb">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <NavLink
              to="/config/customers"
              end
              className={({ isActive, isPending }) => {
                return isActive ? 'active' : isPending ? 'pending' : '';
              }}
            >
              All customers
            </NavLink>
          </li>
          <li className="breadcrumb-item active">Add Customer Template</li>
        </ol>
      </nav>

      <PageHeader>Add Customer Template</PageHeader>
      <CustomerTemplateAddForm />
    </div>
  );
}
