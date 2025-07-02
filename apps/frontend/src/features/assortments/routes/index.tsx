import { Navigate, Route, Routes } from 'react-router-dom';

import { AssortmentList } from './assortment-overview';
import { AssortmentView } from './assortment-view';

export function AssortmentsRoutes() {
  return (
    <Routes>
      <Route path="" element={<AssortmentList />} />
      <Route path=":assortmentId" element={<AssortmentView />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
}
