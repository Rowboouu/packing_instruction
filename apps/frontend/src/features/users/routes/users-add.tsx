import PageHeader from '@/components/page-header';
import { NavLink } from 'react-router-dom';
import { UserAddForm } from '../components/user-add-form';

export function UsersAdd() {
  return (
    <>
      <div className="mx-n4 mx-lg-n6 px-6 position-relative">
        <nav className="mb-2" aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <a href="#!"></a>
              <NavLink
                to="/users"
                end
                className={({ isActive, isPending }) => {
                  return isActive ? 'active' : isPending ? 'pending' : '';
                }}
              >
                All Users
              </NavLink>
            </li>
            <li className="breadcrumb-item active">New User</li>
          </ol>
        </nav>

        <PageHeader>Add New User</PageHeader>

        <UserAddForm />
      </div>
    </>
  );
}
