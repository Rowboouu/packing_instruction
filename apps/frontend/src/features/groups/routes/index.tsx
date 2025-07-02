import { Navigate, Route, Routes } from 'react-router-dom';

import { Groups } from './group-list';
import { GroupSalesOrderAssortmentView } from './group-sales-order-assortments-view';
import { GroupSalesOrderView } from './group-sales-order-view';
import { GroupView } from './group-view';

export const GroupRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Groups />} />
      <Route path=":groupId" element={<GroupView />} />
      <Route path=":groupId/:salesOrderId" element={<GroupSalesOrderView />} />
      <Route
        path=":groupId/:salesOrderId/:assortmentId"
        element={<GroupSalesOrderAssortmentView />}
      />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};
