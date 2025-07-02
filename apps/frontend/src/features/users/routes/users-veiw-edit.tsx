import { LoadingContent } from '@/components/loader/loading-content';
import PageHeader from '@/components/page-header';
import { ViewType } from '@/constant';
import useGetInitialData from '@/hooks/useGetInititalData';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { getUserQuery, useGetUser } from '../api/getUser';
import { UserEditForm } from '../components/user-edit-form';

export function UserViewEdit() {
  const params = useParams();
  const navigate = useNavigate();

  const userId = (params?.userId as string) ?? '';
  const viewType = (params?.viewType as ViewType) ?? 'view';

  const query = getUserQuery(userId);
  const initialData = useGetInitialData(query);

  const { data, isLoading, isError } = useGetUser(userId, {
    initialData,
  });

  if (isLoading) {
    return <LoadingContent />;
  }

  if (isError) {
    navigate('/users');
  }

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
            <li className="breadcrumb-item active">{data?.name}</li>
          </ol>
        </nav>

        <PageHeader>{data?.name}</PageHeader>

        <UserEditForm user={data} viewType={viewType} />
      </div>
    </>
  );
}
