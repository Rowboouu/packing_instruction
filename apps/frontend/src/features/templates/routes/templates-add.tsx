import PageHeader from '@/components/page-header';
import { NavLink } from 'react-router-dom';
import { TemplateAddForm } from '..';

export function TemplateAdd() {
  return (
    <div className="mx-n4 mx-lg-n6 px-6 position-relative">
      <nav className="mb-2" aria-label="breadcrumb">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <NavLink
              to="/config/templates"
              end
              className={({ isActive, isPending }) => {
                return isActive ? 'active' : isPending ? 'pending' : '';
              }}
            >
              All templates
            </NavLink>
          </li>
          <li className="breadcrumb-item active">Create new template</li>
        </ol>
      </nav>

      <PageHeader>Create New Template</PageHeader>

      <TemplateAddForm />
    </div>
  );
}
