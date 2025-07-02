import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'sonner';

import { Loader } from '@/components/loader/Loader';
import { Page500 } from '@/components/page-500';
import { i18next } from '@/i18n';
import { queryClient } from '@/lib/react-query';
import { I18nextProvider } from 'react-i18next';
import { SocketProvider } from './SocketProvider';

interface AppProviderProps extends React.PropsWithChildren {}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundary fallback={<Page500 />}>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <I18nextProvider i18n={i18next}>
            <React.Suspense
              fallback={
                <div className="d-flex align-items-center justify-content-center vh-100">
                  <Loader />
                </div>
              }
            >
              {children}
            </React.Suspense>
          </I18nextProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <div className="position-absolute">
            <Toaster richColors closeButton />
          </div>
        </SocketProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}