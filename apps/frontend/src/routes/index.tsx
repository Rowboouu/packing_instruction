import React from 'react';
import { useRoutes, Outlet, Navigate } from 'react-router-dom';

import { MainLayout } from '@/components/layouts/main-layout';
import { Loader } from '@/components/loader/Loader';
import { ModalPortal } from '@/components/modal-portal';
import { lazyImport } from '@/utils/lazyImport';

// Lazy-loaded components and features
const { Page404 } = lazyImport(
  () => import('@/components/page-404'),
  'Page404',
);

const { PackingInstructionOverview } = lazyImport(
  () => import('@/features/packing-instructions'),
  'PackingInstructionOverview',
);

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

const appRoutes = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: '', element: <Navigate to="/packing-instruction" replace /> },
      {
        path: '/packing-instruction/:identifier',
        element: <PackingInstructionOverview />,
      }
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