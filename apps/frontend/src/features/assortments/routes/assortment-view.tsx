import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { Breadcrumbs } from '@/components/breadcrumbts';
import useGetInitialData from '@/hooks/useGetInititalData';
import {
  AssortmentHeader,
  AssortmentItem,
  getAssortmentQuery,
  useGetAssortment,
} from '..';

export function AssortmentView() {
  const { t } = useTranslation();
  const params = useParams();
  const assortmentId = (params?.assortmentId as string) ?? '';

  const assortmentQuery = getAssortmentQuery(assortmentId);
  const initialAssortmentData = useGetInitialData(assortmentQuery);
  const { data: assortment, isLoading } = useGetAssortment(assortmentId, {
    initialData: initialAssortmentData,
  });

  return (
    <>
      <Breadcrumbs
        isLoading={isLoading}
        breadcrumbs={[
          {
            to: `/assortments`,
            label: t('keyNavigation_assortments'),
          },
          { to: '#', label: assortment?.customerItemNo, active: true },
        ]}
      />
      <AssortmentHeader assortment={assortment} isLoading={isLoading} />
      {assortment && <AssortmentItem assortment={assortment} />}
    </>
  );
}
