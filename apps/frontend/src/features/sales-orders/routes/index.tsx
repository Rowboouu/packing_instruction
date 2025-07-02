import { Navigate, Route, Routes } from 'react-router-dom';

import { SalesOrders } from './sales-order-list';
import { SalesOrderView } from './sales-order-view';

export const SalesOrderRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<SalesOrders />} />
      <Route path=":salesOrderId" element={<SalesOrderView />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};
