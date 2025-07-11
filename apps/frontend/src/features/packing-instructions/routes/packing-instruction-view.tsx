// src/features/packing-instructions/routes/packing-instruction-view.tsx
// MINIMAL CHANGES to fix TypeScript errors

import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbts';
import useGetInitialData from '@/hooks/useGetInititalData';
import {
  useGetAssortmentSmart,
  useInvalidateAssortmentCache,
  getWebhookAssortmentQuery,
  AssortmentData,
  AssortmentStatus
} from '@/features/packing-instructions';
import { PackingInstructionHeader } from '../components/packing-instruction-header';
import { PackingInstructionItem } from '../components/packing-instruction-item';

interface PackingInstructionViewProps {
  assortmentId?: string;
}

type ExtendedDataSource = 'webhook-cached' | 'traditional' | 'navigation-fallback' | 'navigation';

export function PackingInstructionView({ assortmentId: propAssortmentId }: PackingInstructionViewProps) {
  const { t } = useTranslation();
  const { identifier } = useParams<{ identifier: string }>();
  const location = useLocation();

  // Support both prop and URL param
  const assortmentId = propAssortmentId || identifier || '';

  // Check if we have data from navigation state (from table/card click)
  const navigationData = location.state?.assortmentData;
  
  // Cache management hooks
  const { invalidateAssortment, getCacheStats } = useInvalidateAssortmentCache();

  // State for cache debugging (remove in production)
  const [showCacheInfo, setShowCacheInfo] = useState(false);

  // Use webhook assortment query with initial data support
  const webhookAssortmentQuery = getWebhookAssortmentQuery(assortmentId);
  const initialWebhookData = useGetInitialData(webhookAssortmentQuery);

  // Use smart hook with simplified options (FIX: Remove onSuccess/onError to avoid type errors)
  const {
    data: assortmentData,
    isLoading,
    error,
    dataSource,
    cacheStats
  } = useGetAssortmentSmart(assortmentId, true, {
    initialData: initialWebhookData,
    enabled: !!assortmentId && assortmentId.startsWith('A'),
    retry: (failureCount: number) => {
      return failureCount < 2;
    },
  });

  // Check if we have valid data, if not and we have navigation data, create fallback data
  const hasValidData = assortmentData?.baseAssortment?.itemNo && assortmentData?.baseAssortment?.name;
  const shouldUseFallback = !hasValidData && navigationData && navigationData.itemNo && navigationData.name;

  // Create fallback AssortmentData from navigation data
  const fallbackAssortmentData = useMemo(() => {
    if (!shouldUseFallback) return null;

    const fallbackData: AssortmentData = {
      baseAssortment: {
        _id: navigationData._id?.toString() || navigationData.itemNo || '',
        itemNo: navigationData.itemNo || '',
        customerItemNo: navigationData.customerItemNo || '',
        name: navigationData.name || '',
        orderId: navigationData.orderId || 0,
        productId: navigationData.productId || 0,
        status: String(navigationData.status || 'pending'), // FIX: Ensure status is always string
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
          status: String(navigationData.status || 'pending') as AssortmentStatus, // FIX: Proper type casting
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
        source: 'webhook', // FIX: Use valid source type
        lastModified: new Date(),
        version: 1,
        syncedAt: new Date(),
        isWebhookData: false,
        dataSource: 'navigation',
        // FIX: Don't add persistentStorageEnabled to avoid type errors
      },
    };

    return fallbackData;
  }, [shouldUseFallback, navigationData]);

  // Use fallback data if needed
  const finalAssortmentData = shouldUseFallback ? fallbackAssortmentData : assortmentData;
  const finalDataSource: ExtendedDataSource = shouldUseFallback ? 'navigation-fallback' : dataSource;

  // Extract the merged assortment data for components
  const assortment = finalAssortmentData?.mergedData?.assortment;
  const fallbackAssortment = finalAssortmentData?.baseAssortment;
  const displayAssortment = assortment || fallbackAssortment;

  // Cache management functions
  const handleInvalidateCache = async () => {
    try {
      await invalidateAssortment(assortmentId);
      console.log(`Cache invalidated for ${assortmentId}`);
      window.location.reload();
    } catch (error) {
      console.error(`Failed to invalidate cache for ${assortmentId}:`, error);
    }
  };

  const handleRefreshCacheStats = () => {
    const stats = getCacheStats();
    console.log('Cache stats:', stats);
  };

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
          <div>Loading assortment {assortmentId} with enhanced caching...</div>
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
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
              <button 
                onClick={handleInvalidateCache}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Clear Cache & Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Simple data source indicator (remove in production)
  const dataSourceIndicator = shouldUseFallback ? (
    <div className="mb-4 p-2 bg-orange-100 rounded text-sm">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">Data Source:</span> Navigation Fallback
          <span className="ml-2 text-orange-600">
            (Using navigation data)
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCacheInfo(!showCacheInfo)}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showCacheInfo ? 'Hide' : 'Show'} Cache Info
          </button>
          <button
            onClick={handleInvalidateCache}
            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Cache
          </button>
        </div>
      </div>
      {showCacheInfo && cacheStats && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
          <p><strong>Cache Stats:</strong></p>
          <p>Total Queries: {cacheStats.totalQueries}</p>
          <p>Assortment Queries: {cacheStats.assortmentQueries}</p>
          <p>Cached Assortments: {cacheStats.cachedAssortments.join(', ')}</p>
        </div>
      )}
    </div>
  ) : (
    <div className="mb-4 p-2 bg-green-100 rounded text-sm">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">Enhanced Data Source:</span> {finalDataSource}
          {finalAssortmentData?.metadata?.version && (
            <span className="ml-2 text-gray-600">
              v{finalAssortmentData.metadata.version}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCacheInfo(!showCacheInfo)}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showCacheInfo ? 'Hide' : 'Show'} Cache Info
          </button>
          <button
            onClick={handleInvalidateCache}
            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Cache
          </button>
          <button
            onClick={handleRefreshCacheStats}
            className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Refresh Stats
          </button>
        </div>
      </div>
      {showCacheInfo && cacheStats && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
          <p><strong>Cache Stats:</strong></p>
          <p>Total Queries: {cacheStats.totalQueries}</p>
          <p>Assortment Queries: {cacheStats.assortmentQueries}</p>
          <p>Stale Queries: {cacheStats.staleQueries}</p>
          <p>Cached Assortments: {cacheStats.cachedAssortments.join(', ')}</p>
        </div>
      )}
    </div>
  );

  // Main content rendering
  return (
    <>
      <Breadcrumbs
        isLoading={isLoading && !shouldUseFallback}
        breadcrumbs={[
          {
            to: `/packing-instruction/${assortmentId}`,
            label: t('keyNavigation_packingInstructions') || 'Packing Instructions',
          },
          {
            to: '#',
            label: displayAssortment?.itemNo || assortmentId,
            active: true,
          },
        ]}
      />
      
      {/* Enhanced data source indicator - remove in production */}
      {dataSourceIndicator}
      
      <PackingInstructionHeader 
        assortment={displayAssortment} 
        isLoading={isLoading && !shouldUseFallback}
      />
      
      {displayAssortment && <PackingInstructionItem assortment={displayAssortment} />}
    </>
  );
}// src/features/packing-instructions/routes/packing-instruction-view.tsx
// MINIMAL CHANGES to fix TypeScript