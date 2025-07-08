import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbts';
import useGetInitialData from '@/hooks/useGetInititalData';
import {
  useGetAssortmentSmart,
  getWebhookAssortmentQuery,
  AssortmentData,
  useGetWebhookAssortment,
  AssortmentStatus
} from '@/features/packing-instructions';
import { PackingInstructionHeader } from '../components/packing-instruction-header';
import { PackingInstructionItem } from '../components/packing-instruction-item';

interface PackingInstructionViewProps {
  assortmentId?: string;
}

// Extended data source type to include fallback options
type ExtendedDataSource = 'webhook' | 'traditional' | 'navigation-fallback' | 'navigation';

export function PackingInstructionView({ assortmentId: propAssortmentId }: PackingInstructionViewProps) {
  const { t } = useTranslation();
  const { identifier } = useParams<{ identifier: string }>();
  const location = useLocation();

  // Support both prop and URL param
  const assortmentId = propAssortmentId || identifier || '';

  // Check if we have data from navigation state (from table/card click)
  const navigationData = location.state?.assortmentData;
  const fromTable = location.state?.fromTable === true;

  console.log('--- PackingInstructionView Debug Start ---');
  console.log('1. assortmentId:', assortmentId);
  console.log('2. navigationData:', navigationData);
  console.log('3. fromTable:', fromTable);

  // Use webhook assortment query with initial data support
  const webhookAssortmentQuery = getWebhookAssortmentQuery(assortmentId);
  const initialWebhookData = useGetInitialData(webhookAssortmentQuery);

  // FOR TESTING: Force webhook API only (comment out when traditional API is working)
  const {
    data: assortmentData,
    isLoading,
    error,
  } = useGetWebhookAssortment(assortmentId, {
    initialData: initialWebhookData,
    enabled: !!assortmentId && assortmentId.startsWith('A'),
    retry: (failureCount, error) => {
      console.log(`Webhook API retry attempt ${failureCount} for assortment ${assortmentId}:`, error);
      return failureCount < 2;
    },
  });
  
  const dataSource: ExtendedDataSource = 'webhook'; // Since we're forcing webhook

  // ALTERNATIVE: Use smart hook (uncomment when you want both APIs)
  // const {
  //   data: assortmentData,
  //   isLoading,
  //   error,
  //   dataSource
  // } = useGetAssortmentSmart(assortmentId, true, {
  //   initialData: initialWebhookData,
  //   enabled: !!assortmentId && assortmentId.startsWith('A'),
  //   retry: (failureCount, error) => {
  //     console.log(`Retry attempt ${failureCount} for assortment ${assortmentId}:`, error);
  //     return failureCount < 2;
  //   },
  // });

  console.log('4. assortmentData:', assortmentData);
  console.log('5. dataSource:', dataSource);
  console.log('6. isLoading:', isLoading);
  console.log('7. error:', error);

  // Check if we have valid data, if not and we have navigation data, create fallback data
  const hasValidData = assortmentData?.baseAssortment?.itemNo && assortmentData?.baseAssortment?.name;
  const shouldUseFallback = !hasValidData && navigationData && navigationData.itemNo && navigationData.name;

  console.log('8. hasValidData:', hasValidData);
  console.log('9. shouldUseFallback:', shouldUseFallback);

  // Create fallback AssortmentData from navigation data
  const fallbackAssortmentData = useMemo(() => {
    if (!shouldUseFallback) return null;

    console.log('10. Creating fallback data from navigationData:', navigationData);

    const fallbackData: AssortmentData = {
      baseAssortment: {
        _id: navigationData._id?.toString() || navigationData.itemNo || '',
        itemNo: navigationData.itemNo || '',
        customerItemNo: navigationData.customerItemNo || '',
        name: navigationData.name || '',
        orderId: navigationData.orderId || 0,
        productId: navigationData.productId || 0,
        status: (navigationData.status as AssortmentStatus) || 'pending',
        length_cm: navigationData.length_cm || 0,
        width_cm: navigationData.width_cm || 0,
        height_cm: navigationData.height_cm || 0,
        master_carton_length_cm: navigationData.master_carton_length_cm || 0,
        master_carton_width_cm: navigationData.master_carton_width_cm || 0,
        master_carton_height_cm: navigationData.master_carton_height_cm || 0,
        inner_carton_length_cm: navigationData.inner_carton_length_cm || 0,
        inner_carton_width_cm: navigationData.inner_carton_width_cm || 0,
        inner_carton_height_cm: navigationData.inner_carton_height_cm || 0,
        webhookImages: navigationData.webhookImages || {
          itemPackImages: [],
          itemBarcodeImages: [],
          displayImages: [],
          innerCartonImages: [],
          masterCartonImages: [],
        },
        sourceOrderName: navigationData.sourceOrderName,
        salesOrder: navigationData.salesOrder,
      },
      userModifications: {
        uploadedImages: {},
        imageLabels: {},
        customFields: {},
        formData: {},
      },
      mergedData: {
        assortment: {
          _id: navigationData._id?.toString() || navigationData.itemNo || '',
          orderItemId: navigationData._id || 0,
          customerItemNo: navigationData.customerItemNo || null,
          itemNo: navigationData.itemNo || '',
          name: navigationData.name || '',
          orderId: navigationData.orderId || 0,
          productId: navigationData.productId || 0,
          createdAt: navigationData.createdAt || new Date().toISOString(),
          updatedAt: navigationData.updatedAt || new Date().toISOString(),
          status: (navigationData.status as AssortmentStatus) || 'pending',
          uploadStatus: 'pending',
          length_cm: navigationData.length_cm || 0,
          width_cm: navigationData.width_cm || 0,
          height_cm: navigationData.height_cm || 0,
          master_carton_length_cm: navigationData.master_carton_length_cm || 0,
          master_carton_width_cm: navigationData.master_carton_width_cm || 0,
          master_carton_height_cm: navigationData.master_carton_height_cm || 0,
          inner_carton_length_cm: navigationData.inner_carton_length_cm || 0,
          inner_carton_width_cm: navigationData.inner_carton_width_cm || 0,
          inner_carton_height_cm: navigationData.inner_carton_height_cm || 0,
          masterCUFT: navigationData.masterCUFT,
          masterGrossWeight: navigationData.masterGrossWeight,
          productInCarton: navigationData.productInCarton,
          productPerUnit: navigationData.productPerUnit,
          pcfImages: navigationData.webhookImages || navigationData.pcfImages || {
            itemPackImages: [],
            itemBarcodeImages: [],
            displayImages: [],
            innerCartonImages: [],
            masterCartonImages: [],
          },
        },
        allImages: {
          itemPackImages: [],
          itemBarcodeImages: [],
          displayImages: [],
          innerCartonImages: [],
          masterCartonImages: [],
        },
        webhookImages: navigationData.webhookImages || navigationData.pcfImages || {
          itemPackImages: [],
          itemBarcodeImages: [],
          displayImages: [],
          innerCartonImages: [],
          masterCartonImages: [],
        },
        imageLabels: {},
        combinedImageCount: 0, // Calculate if needed
      },
      metadata: {
        source: 'navigation-fallback' as any, // Type assertion to handle extended source
        lastModified: new Date(),
        version: 1,
        syncedAt: new Date(),
        isWebhookData: false,
        dataSource: 'navigation',
      },
    };

    console.log('11. Created fallbackAssortmentData:', fallbackData);
    return fallbackData;
  }, [shouldUseFallback, navigationData]);

  // Use fallback data if needed
  const finalAssortmentData = shouldUseFallback ? fallbackAssortmentData : assortmentData;
  const finalDataSource: ExtendedDataSource = shouldUseFallback ? 'navigation-fallback' : dataSource;

  console.log('12. finalAssortmentData:', finalAssortmentData);
  console.log('13. finalDataSource:', finalDataSource);

  // Extract the merged assortment data for components
  const assortment = finalAssortmentData?.mergedData?.assortment;

  console.log('14. assortment (for components):', assortment);
  console.log('15. assortment?.itemNo:', assortment?.itemNo);
  console.log('16. assortment?.name:', assortment?.name);
  console.log('17. assortmentData structure check:');
  console.log('    - finalAssortmentData exists:', !!finalAssortmentData);
  console.log('    - mergedData exists:', !!finalAssortmentData?.mergedData);
  console.log('    - mergedData.assortment exists:', !!finalAssortmentData?.mergedData?.assortment);
  console.log('    - baseAssortment exists:', !!finalAssortmentData?.baseAssortment);
  console.log('    - baseAssortment.itemNo:', finalAssortmentData?.baseAssortment?.itemNo);
  console.log('    - baseAssortment.name:', finalAssortmentData?.baseAssortment?.name);
  console.log('--- PackingInstructionView Debug End ---');

  // Fallback: try to get data from baseAssortment if mergedData.assortment is empty
  const fallbackAssortment = finalAssortmentData?.baseAssortment;
  const displayAssortment = assortment || fallbackAssortment;

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

  if (isLoading && !shouldUseFallback) {
    return (
      <>
        <Breadcrumbs 
          isLoading={true} 
          breadcrumbs={[
            {
              to: `/packing-instruction`,
              label: t('keyNavigation_packingInstructions') || 'Packing Instructions',
            },
            {
              to: '#',
              label: assortmentId,
              active: true,
            },
          ]}
        />
        <PackingInstructionHeader isLoading={true} />
        <div className="flex items-center justify-center py-8">
          <div>Loading assortment {assortmentId}...</div>
        </div>
      </>
    );
  }

  // Handle error state for webhook failures (only if no fallback data available)
  if (error && !finalAssortmentData) {
    return (
      <>
        <Breadcrumbs 
          isLoading={false} 
          breadcrumbs={[
            {
              to: `/packing-instruction`,
              label: t('keyNavigation_packingInstructions') || 'Packing Instructions',
            },
            {
              to: '#',
              label: assortmentId,
              active: true,
            },
          ]}
        />
        <PackingInstructionHeader isLoading={false} />
        <div className="flex items-center justify-center py-8">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Assortment Not Found</h2>
            <p className="text-red-600 mb-4">
              {error.message || `Could not load assortment ${assortmentId}`}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              To access individual assortments, you need to either:
            </p>
            <ul className="text-sm text-gray-600 text-left mb-4 space-y-1">
              <li>• Click from a sales order table, or</li>
              <li>• Use the individual assortment button in Odoo to send the data first</li>
            </ul>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  // Show data source indicator for debugging (remove in production)
  const dataSourceIndicator = shouldUseFallback ? (
    <div className="mb-4 p-2 bg-orange-100 rounded text-sm">
      <span className="font-medium">Data Source:</span> Navigation Fallback
      <span className="ml-2 text-orange-600">
        (Using navigation data due to empty API response)
      </span>
    </div>
  ) : (
    <div className="mb-4 p-2 bg-blue-100 rounded text-sm">
      <span className="font-medium">Data Source:</span> {finalDataSource}
    </div>
  );

  // Main content rendering
  return (
    <>
      <Breadcrumbs
        isLoading={isLoading && !shouldUseFallback}
        breadcrumbs={[
          {
            to: `/packing-instruction`,
            label: t('keyNavigation_packingInstructions') || 'Packing Instructions',
          },
          {
            to: '#',
            label: displayAssortment?.customerItemNo || displayAssortment?.itemNo || assortmentId,
            active: true,
          },
        ]}
      />
      
      {/* Temporary data source indicator - remove in production */}
      {dataSourceIndicator}
      
      <PackingInstructionHeader 
        assortment={displayAssortment} 
        isLoading={isLoading && !shouldUseFallback}
        dataSource={finalDataSource as any} // Type assertion for compatibility
      />
      
      {displayAssortment && <PackingInstructionItem assortment={displayAssortment} />}
    </>
  );
}