import { ReactNode } from 'react';

interface PageHeaderProps {
  children: ReactNode;
  isLoading?: boolean;
}

function PageHeader({ children, isLoading }: PageHeaderProps) {
  return (
    <h2 className="text-bold mb-5 placeholder-glow">
      {isLoading ? <span className="placeholder col-4" /> : <>{children}</>}
    </h2>
  );
}

export default PageHeader;
