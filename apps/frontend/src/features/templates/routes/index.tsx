import { Route, Routes } from 'react-router-dom';

import { TemplateAdd } from './templates-add';
import { TemplateEdit } from './templates-edit';
import { Templates } from './templates-list';

export const TemplatesRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Templates />} />
      <Route path="new" element={<TemplateAdd />} />
      <Route path="template/:templateId" element={<TemplateEdit />} />
    </Routes>
  );
};
