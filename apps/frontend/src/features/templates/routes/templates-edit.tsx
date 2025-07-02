import { LoadingContent } from '@/components/loader/loading-content';
import PageHeader from '@/components/page-header';
import useGetInitialData from '@/hooks/useGetInititalData';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { getTemplateQuery, useGetTemplate } from '../api/getTemplate';
import { TemplateEditForm } from '../components/template-edit-form';

export function TemplateEdit() {
  const params = useParams();
  const navigate = useNavigate();

  const templateId = (params?.templateId as string) ?? '';

  const query = getTemplateQuery(templateId);
  const initialData = useGetInitialData(query);

  const { data, isLoading, isError } = useGetTemplate(templateId, {
    initialData,
  });

  if (isLoading) {
    return <LoadingContent />;
  }

  if (isError) {
    navigate('/config/templates');
  }

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
          <li className="breadcrumb-item active">{data?.name}</li>
        </ol>
      </nav>

      <PageHeader>{data?.name}</PageHeader>
      <TemplateEditForm template={data} />
    </div>
  );
}
