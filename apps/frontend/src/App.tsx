import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import '@/assets/css/custom.css';
import '@/assets/css/pdf.style.css';
import '@/assets/css/simplebar.min.css';
import '@/assets/css/style.css';
import '@/assets/css/theme.min.css';
import './index.css';

import { useSideBarStore } from '@/lib/store/sideBarStore';
import { AppProvider } from '@/providers/AppProvider';
import { AppRoutes } from '@/routes';

function App() {
  const { isSideBarCollapse } = useSideBarStore();

  React.useLayoutEffect(() => {
    const bodyClassList = document.body.classList;
    bodyClassList.toggle('navbar-vertical-collapsed', isSideBarCollapse);
  }, [isSideBarCollapse]);

  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
