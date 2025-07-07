import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from '@/components/loader/Loader';
import { PCFImagesPage } from '../../pcf-images/routes/pcf-images-page';
import { PCFPreviewPage } from '../../pcf-images/routes/pcf-preview-page';

// Interface for Odoo webhook payload (different from your existing Assortment type)
interface OdooImage {
  id: number;
  componentName: string;
  image: string;
  filename: string;
}

interface OdooPcfImages {
  itemPackImages: OdooImage[][];
  itemBarcodeImages: OdooImage[];
  displayImages: OdooImage[];
  innerCartonImages: OdooImage[];
  masterCartonImages: OdooImage[];
}

interface OdooAssortment {
  _id: number;
  customerItemNo: string;
  itemNo: string;
  name: string;
  orderId: number;
  productId: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  master_carton_length_cm: number;
  master_carton_width_cm: number;
  master_carton_height_cm: number;
  inner_carton_length_cm: number;
  inner_carton_width_cm: number;
  inner_carton_height_cm: number;
  pcfImages: OdooPcfImages;
}

interface WebhookData {
  salesOrder: {
    id: string;
    customer: string;
    customer_po: string;
  };
  assortments: OdooAssortment[];
}

// Helper function to convert OdooAssortment to your existing Assortment type
const convertOdooToAssortment = (odooAssortment: OdooAssortment): any => {
  return {
    // Map required Assortment fields
    _id: odooAssortment._id.toString(),
    orderItemId: odooAssortment._id,
    customerItemNo: odooAssortment.customerItemNo,
    itemNo: odooAssortment.itemNo,
    name: odooAssortment.name,
    orderId: odooAssortment.orderId,
    productId: odooAssortment.productId,
    
    // Add missing required fields with sensible defaults
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'pending' as const,
    
    // Dimensions
    length_cm: odooAssortment.length_cm,
    width_cm: odooAssortment.width_cm,
    height_cm: odooAssortment.height_cm,
    master_carton_length_cm: odooAssortment.master_carton_length_cm,
    master_carton_width_cm: odooAssortment.master_carton_width_cm,
    master_carton_height_cm: odooAssortment.master_carton_height_cm,
    inner_carton_length_cm: odooAssortment.inner_carton_length_cm,
    inner_carton_width_cm: odooAssortment.inner_carton_width_cm,
    inner_carton_height_cm: odooAssortment.inner_carton_height_cm,
    
    // PCF Images - convert Odoo structure to your component's expected structure
    pcfImages: {
      itemPackImages: odooAssortment.pcfImages.itemPackImages,
      itemBarcodeImages: odooAssortment.pcfImages.itemBarcodeImages,
      displayImages: odooAssortment.pcfImages.displayImages,
      innerCartonImages: odooAssortment.pcfImages.innerCartonImages,
      masterCartonImages: odooAssortment.pcfImages.masterCartonImages,
    },
    
    // Add any other fields your Assortment type requires
    // You may need to add more fields based on your actual Assortment interface
  };
};

export function PackingInstructionPage() {
  const { identifier } = useParams<{ identifier: string }>();
  const [webhookData, setWebhookData] = useState<WebhookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'images' | 'preview'>('images');
  const [selectedAssortment, setSelectedAssortment] = useState<number>(0);

  useEffect(() => {
    const fetchWebhookData = async () => {
      if (!identifier) {
        setError('No identifier provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔍 Fetching webhook data for: ${identifier}`);
        
        // Fetch webhook data from your backend
        const response = await fetch(`/webhook/data/${identifier}`);
        const result = await response.json();
        
        console.log('📦 Webhook API Response:', result);
        
        if (result.success && result.data) {
          console.log('✅ Successfully loaded webhook data:', {
            orderName: result.data.orderName,
            customer: result.data.salesOrder?.customer,
            assortmentCount: result.data.assortments?.length || 0,
            totalImages: result.data.metadata?.totalImages || 0
          });
          
          setWebhookData(result.data);
        } else {
          const errorMsg = result.message || `No data found for ${identifier}`;
          console.warn('⚠️ No webhook data found:', errorMsg);
          setError(errorMsg);
        }
      } catch (err) {
        const errorMsg = 'Failed to load packing instruction data';
        console.error('❌ Error fetching webhook data:', err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchWebhookData();
  }, [identifier]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader />
        <p className="mt-4 text-gray-600">Loading packing instructions for {identifier}...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Data</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-600">
            Make sure the Odoo webhook has been triggered for order: <strong>{identifier}</strong>
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!webhookData || !webhookData.assortments || webhookData.assortments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">No Data Available</h2>
          <p className="text-yellow-700 mb-4">
            No packing instruction data found for: <strong>{identifier}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Please trigger the webhook from Odoo first.
          </p>
        </div>
      </div>
    );
  }

  // Convert Odoo assortment to your component's expected format
  const currentOdooAssortment = webhookData.assortments[selectedAssortment];
  const currentAssortment = convertOdooToAssortment(currentOdooAssortment);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with order info and navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Packing Instructions - {webhookData.salesOrder.id}
              </h1>
              <p className="text-gray-600">
                Customer: {webhookData.salesOrder.customer} 
                {webhookData.salesOrder.customer_po && (
                  <span className="ml-2">| PO: {webhookData.salesOrder.customer_po}</span>
                )}
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentView('images')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentView === 'images'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                PCF Images
              </button>
              <button
                onClick={() => setCurrentView('preview')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentView === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Assortment Selector (if multiple assortments) */}
          {webhookData.assortments.length > 1 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Assortment:
              </label>
              <select
                value={selectedAssortment}
                onChange={(e) => setSelectedAssortment(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                {webhookData.assortments.map((assortment, index) => (
                  <option key={assortment._id} value={index}>
                    {assortment.itemNo} - {assortment.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'images' ? (
          <PCFImagesPage assortment={currentAssortment} />
        ) : (
          <PCFPreviewPage assortment={currentAssortment} />
        )}
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs max-w-xs">
          <details>
            <summary className="cursor-pointer">Debug Info</summary>
            <div className="mt-2 space-y-1">
              <div>Order: {webhookData.salesOrder.id}</div>
              <div>Assortments: {webhookData.assortments.length}</div>
              <div>Current: {currentOdooAssortment.itemNo}</div>
              <div>Images: {currentOdooAssortment.pcfImages.itemPackImages.length} packs</div>
              <div>Converted ID: {currentAssortment._id}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}