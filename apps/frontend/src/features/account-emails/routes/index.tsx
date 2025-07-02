import { Route, Routes } from 'react-router-dom';
import { EmailCompose } from './email-compose';

export const AccountEmailRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<EmailCompose />} />
    </Routes>
  );
};
