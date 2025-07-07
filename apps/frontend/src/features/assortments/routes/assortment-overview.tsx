import { useTranslation } from 'react-i18next';
import { useDebounceValue } from 'usehooks-ts';
import PageHeader from '@/components/page-header';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';
import { AssortmentDataView, useGetInfiniteAssortment } from '..';
import { useGetSalesOrder } from '@/features/packing-instructions';

// Updated component with optional salesOrderId prop
export function AssortmentList({
  salesOrderId,
}: { salesOrderId?: string } = {}) {
  // const { t } = useTranslation();

  // If we have a salesOrderId, show the sales order specific view
  if (salesOrderId) {
    return <SalesOrderAssortmentsList salesOrderId={salesOrderId} />;
  }

  // Otherwise, show the existing infinite list view
  return <InfiniteAssortmentsList />;
}

// New component for sales order specific view
function SalesOrderAssortmentsList({ salesOrderId }: { salesOrderId: string }) {
  // const { t } = useTranslation();
  const { params } = useTypedSearchParams();
  const [keyword] = useDebounceValue(params.keyword, 500);

  // Get sales order data from the new API
  const {
    data: salesOrderData,
    isLoading: salesOrderLoading,
    error,
  } = useGetSalesOrder(salesOrderId);

  // Still use the infinite query but with salesOrderId filter
  const dataQuery = useGetInfiniteAssortment({
    keyword: keyword,
    limit: params.per_page,
    page: params.page,
    status: params.status !== 'all' ? params.status : undefined,
    salesOrderId: salesOrderId, // NEW: Filter by sales order
  });

  if (salesOrderLoading) {
    return (
      <>
        <PageHeader>Loading...</PageHeader>
        <div className="flex items-center justify-center py-8">
          <div>Loading sales order...</div>
        </div>
      </>
    );
  }

  if (error || !salesOrderData) {
    return (
      <>
        <PageHeader>Sales Order Not Found</PageHeader>
        <div className="flex items-center justify-center py-8">
          <div>Sales order {salesOrderId} could not be found.</div>
        </div>
      </>
    );
  }

  const pageTitle = `${salesOrderData.salesOrder.orderNumber} - ${salesOrderData.salesOrder.customer}`;

  return (
    <>
      <PageHeader>{pageTitle}</PageHeader>

      {/* Sales Order Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Sales Order ID:</span>
            <span className="ml-2">{salesOrderData.salesOrder.id}</span>
          </div>
          <div>
            <span className="font-medium">Customer:</span>
            <span className="ml-2">{salesOrderData.salesOrder.customer}</span>
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <span className="ml-2 capitalize">
              {salesOrderData.salesOrder.status}
            </span>
          </div>
        </div>
      </div>

      {/* Use existing AssortmentDataView with filtered data */}
      <AssortmentDataView dataQuery={dataQuery} />
    </>
  );
}

// Extract existing logic into separate component for backwards compatibility
function InfiniteAssortmentsList() {
  const { t } = useTranslation();
  const { params } = useTypedSearchParams();
  const [keyword] = useDebounceValue(params.keyword, 500);

  const dataQuery = useGetInfiniteAssortment({
    keyword: keyword,
    limit: params.per_page,
    page: params.page,
    status: params.status !== 'all' ? params.status : undefined,
    // No salesOrderId filter for the general list
  });

  return (
    <>
      <PageHeader>{t('keyNavigation_assortments')}</PageHeader>
      <AssortmentDataView dataQuery={dataQuery} />
    </>
  );
}
