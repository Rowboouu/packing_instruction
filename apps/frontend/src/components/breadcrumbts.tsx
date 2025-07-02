import { NavLink } from 'react-router-dom';

interface Breadcrumb {
  to: string;
  label?: string | null;
  active?: boolean;
}

interface BreadcrumbsProps {
  isLoading?: boolean;
  breadcrumbs: Breadcrumb[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  breadcrumbs,
  isLoading,
}) => (
  <nav className="mb-2" aria-label="breadcrumb">
    <ol className="breadcrumb mb-0 placeholder-glow">
      {breadcrumbs.map((breadcrumb, index) => (
        <li
          key={index}
          className={`breadcrumb-item ${breadcrumb.active ? 'active' : ''}`}
        >
          {breadcrumb.active && isLoading ? (
            <span
              className="placeholder rounded-2"
              style={{ width: '100px' }}
            />
          ) : (
            <>
              {breadcrumb.active ? (
                breadcrumb.label || ''
              ) : (
                <NavLink
                  to={breadcrumb.to}
                  end
                  className={({ isActive, isPending }) => {
                    return isActive ? 'active' : isPending ? 'pending' : '';
                  }}
                >
                  {breadcrumb.label || ''}
                </NavLink>
              )}
            </>
          )}
        </li>
      ))}
    </ol>
  </nav>
);
