import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Breadcrumbs } from '@/components/breadcrumbts';
import useGetInitialData from '@/hooks/useGetInititalData';
import { AssortmentHeader } from '..';
import {
  useGetAssortment,
  getAssortmentQuery,
} from '@/features/packing-instructions';

export function AssortmentView({
  assortmentId: propAssortmentId,
}: { assortmentId?: string } = {}) {
  const { t } = useTranslation();
  const params = useParams();

  // Support both prop and URL param
  const assortmentId =
    propAssortmentId || (params?.assortmentId as string) || '';

  // Use the new packing-instructions API query
  const assortmentQuery = getAssortmentQuery(assortmentId);
  const initialAssortmentData = useGetInitialData(assortmentQuery);

  const { data: assortmentData, isLoading } = useGetAssortment(assortmentId, {
    initialData: initialAssortmentData,
  });

  // Extract the merged assortment data for backwards compatibility
  const assortment = assortmentData?.mergedData?.assortment;

  if (!assortmentId) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No assortment specified
          </h2>
          <p className="text-gray-600">Please provide a valid assortment ID</p>
        </div>
      </div>
    );
  }

  if (!assortmentId.startsWith('A')) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Invalid assortment ID
          </h2>
          <p className="text-gray-600">Assortment ID must start with 'A'</p>
          <p className="text-sm text-gray-500 mt-2">
            Current ID:{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {assortmentId}
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs
        isLoading={isLoading}
        breadcrumbs={[
          {
            to: `/packing-instruction`,
            label: t('keyNavigation_assortments'),
          },
          {
            to: '#',
            label: assortment?.customerItemNo || assortmentId,
            active: true,
          },
        ]}
      />
      <AssortmentHeader assortment={assortment} isLoading={isLoading} />
      {/* {assortment && <AssortmentItem assortment={assortment} />} */}
    </>
  );
}
