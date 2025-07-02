import { Navigate, Route, Routes } from 'react-router-dom';

import { UsersAdd } from './users-add';
import { UsersList } from './users-list';
import { UserViewEdit } from './users-veiw-edit';

export const UserRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<UsersList />} />
      <Route path="/new" element={<UsersAdd />} />
      <Route path="/user/:userId/:viewType" element={<UserViewEdit />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
};
