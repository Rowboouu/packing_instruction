import { Route, Routes } from 'react-router-dom';

import { CustomerAddTemplate } from './customer-add-template';
import { Customers } from './customers-list';

export const CustomersRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Customers />} />
      <Route path="/new" element={<CustomerAddTemplate />} />
    </Routes>
  );
};
