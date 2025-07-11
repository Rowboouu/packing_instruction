import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/page-header';
import { Breadcrumbs } from '@/components/breadcrumbts';
import { PackingInstructionDataView } from '../components/packing-instruction-data-view';
import {
  useGetWebhookSalesOrder,
  getWebhookSalesOrderQuery
} from '../api/getSalesOrder';
import { PackingInstructionView } from './packing-instruction-view';
import useGetInitialData from '@/hooks/useGetInititalData';

// Main component that handles routing between sales orders and individual assortments
export function PackingInstructionOverview() {
  const { identifier } = useParams<{ identifier: string }>();

  // Determine if this is a sales order (starts with SOP) or individual assortment (starts with A)
  const isSalesOrder = identifier?.startsWith('SOP') || false;
  const isAssortment = identifier?.startsWith('A') || false;

  // If it's a sales order, show the table view
  if (isSalesOrder && identifier) {
    return <SalesOrderPackingInstructionList salesOrderId={identifier} />;
  }

  // If it's an assortment, show the individual PCF view
  if (isAssortment && identifier) {
    return <IndividualAssortmentView assortmentId={identifier} />;
  }

  // If we can't determine the type, show an error
  return <InvalidIdentifierView identifier={identifier} />;
}

// Component for sales order specific view (table of assortments)
function SalesOrderPackingInstructionList({ salesOrderId }: { salesOrderId: string }) {
  const { t } = useTranslation();

  // Use the webhook sales order API with initial data support
  const salesOrderQuery = getWebhookSalesOrderQuery(salesOrderId);
  const initialSalesOrderData = useGetInitialData(salesOrderQuery);

  const {
    data: salesOrderData,
    isLoading: salesOrderLoading,
    error,
  } = useGetWebhookSalesOrder(salesOrderId, {
    initialData: initialSalesOrderData,
  });

  if (salesOrderLoading) {
    return (
      <>
        <PageHeader isLoading={true}>Loading...</PageHeader>
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
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Sales Order</h2>
            <p className="text-red-600 mb-4">
              {error?.message || `No data found for sales order ${salesOrderId}`}
            </p>
            <p className="text-sm text-gray-600">
              Make sure the Odoo webhook has been triggered for sales order: <strong>{salesOrderId}</strong>
            </p>
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

  const { salesOrder } = salesOrderData;
  const pageTitle = `${salesOrder.orderNumber} - ${salesOrder.customer}`;

  return (
    <>
      <Breadcrumbs
        isLoading={salesOrderLoading}
        breadcrumbs={[
          {
            to: `/packing-instruction/${salesOrder.orderNumber}`,
            label: t('keyNavigation_packingInstructions') || 'Packing Instructions',
          },
          {
            to: '#',
            label: salesOrder.orderNumber,
            active: true,
          },
        ]}
      />

      <PageHeader>{pageTitle}</PageHeader>

      {/* Sales Order Info Card */}
      {/* <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Sales Order:</span>
            <span className="ml-2 text-gray-900">{salesOrder.orderNumber}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Customer:</span>
            <span className="ml-2 text-gray-900">{salesOrder.customer}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Assortments:</span>
            <span className="ml-2 text-gray-900">{salesOrder.totalAssortments}</span>
          </div>
          {salesOrder.customerPO && (
            <div>
              <span className="font-medium text-gray-700">Customer PO:</span>
              <span className="ml-2 text-gray-900">{salesOrder.customerPO}</span>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <span className={`ml-2 font-medium ${
              salesOrder.status === 'active' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {salesOrder.status.charAt(0).toUpperCase() + salesOrder.status.slice(1)}
            </span>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="col-span-1">
              <span className="font-medium text-gray-700">Data Source:</span>
              <span className="ml-2 text-blue-600 text-xs">
                📡 Webhook API ({metadata.source})
              </span>
            </div>
          )}
        </div>
      </div> */}

      {/* Pass the SalesOrderData directly - no transformation needed! */}
      <PackingInstructionDataView 
        salesOrderData={salesOrderData}
        salesOrderId={salesOrderId}
      />
    </>
  );
}

// Component for individual assortment view
function IndividualAssortmentView({ assortmentId }: { assortmentId: string }) {

  return (
    <>
      {/* Use the new PackingInstructionView component */}
      <PackingInstructionView assortmentId={assortmentId} />
    </>
  );
}

// Error component for invalid identifiers
function InvalidIdentifierView({ identifier }: { identifier: string | undefined }) {
  return (
    <>
      <PageHeader>Invalid Identifier</PageHeader>
      <div className="flex items-center justify-center py-8">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Invalid Identifier</h2>
          <p className="text-red-600 mb-4">
            The identifier <strong>{identifier}</strong> is not recognized.
          </p>
          <p className="text-sm text-gray-600">
            Expected format: Sales Order (SOP######) or Assortment (A######)
          </p>
          <div className="mt-4 text-xs text-gray-500">
            <p>Examples:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Sales Order: /packing-instruction/SOP250000</li>
              <li>Individual Assortment: /packing-instruction/A000026</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}