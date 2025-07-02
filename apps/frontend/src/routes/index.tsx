import React from 'react';
import { useRoutes, Outlet, Navigate  } from 'react-router-dom';

import { MainLayout } from '@/components/layouts/main-layout';
import { Loader } from '@/components/loader/Loader';
import { ModalPortal } from '@/components/modal-portal';
import { lazyImport } from '@/utils/lazyImport';

// Lazy-loaded components and features
const { Page404 } = lazyImport(() => import('@/components/page-404'),'Page404');
// const { AccountEmailRoutes } = lazyImport(() => import('@/features/account-emails'), 'AccountEmailRoutes');
// const { GroupRoutes } = lazyImport(() => import('@/features/groups'), 'GroupRoutes');
// const { SalesOrderRoutes } = lazyImport(() => import('@/features/sales-orders'), 'SalesOrderRoutes');
const { AssortmentsRoutes } = lazyImport(() => import('@/features/assortments'), 'AssortmentsRoutes');
// const { CustomersRoutes } = lazyImport(() => import('@/features/customers'), 'CustomersRoutes');
// const { TemplatesRoutes } = lazyImport(() => import('@/features/templates'), 'TemplatesRoutes');
// const { UserRoutes } = lazyImport(() => import('@/features/users'), 'UserRoutes');

// App layout component (previously in protected.tsx)
const AppLayout = () => {
  return (
    <MainLayout>
      <React.Suspense
        fallback={
          <div className="d-flex align-items-center justify-content-center vh-100">
            <Loader />
          </div>
        }
      >
        <Outlet />
      </React.Suspense>
      <ModalPortal />
    </MainLayout>
  );
};

// Static list of all application routes.
// The permission check for '/config/*' routes has been removed.
const appRoutes = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // { path: '/groups/*', element: <GroupRoutes /> },
      { path: '', element: <Navigate to="/assortments" replace /> },
      { path: '/Assortments/*', element: <AssortmentsRoutes /> },
      // { path: '/sales-orders/*', element: <SalesOrderRoutes /> },
      // { path: '/config/customers/*', element: <CustomersRoutes /> },
      // { path: '/config/templates/*', element: <TemplatesRoutes /> },
      // { path: '/users/*', element: <UserRoutes /> },
      // { path: '/emails/*', element: <AccountEmailRoutes /> },
    ],
  },
];

// The main router component, now simplified
export function AppRoutes() {
  const element = useRoutes([
    ...appRoutes,
    {
      path: '*',
      element: <Page404 />,
    },
  ]);

  return <>{element}</>;
}