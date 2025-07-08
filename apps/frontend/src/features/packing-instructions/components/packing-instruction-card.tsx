import { Card, CardFooter } from '@/components/ui/card';
import { CardImg } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSaveIndividualAssortment } from '../api/saveIndividualAssortment';

interface PackingInstructionCardProps {
  assortment: {
    _id: string;
    customerItemNo?: string;
    itemNo: string;
    name: string;
    webhookImageCount: number;
    dimensions: {
      length_cm: number;
      width_cm: number;
      height_cm: number;
    };
    // Add any other properties that come from your SalesOrderData.assortments
  };
  salesOrderId: string;
}

export function PackingInstructionCard({ assortment, salesOrderId }: PackingInstructionCardProps) {
  const navigate = useNavigate();
  const { mutate: saveForStandalone } = useSaveIndividualAssortment({
    showToast: false, // Silent background save
  });

  const handleClick = async () => {
    console.log(`🔄 Navigating to assortment: ${assortment.itemNo}`);
    
    // Save individual assortment in background for future standalone access
    try {
      saveForStandalone({
        assortment: assortment,
        sourceOrderName: salesOrderId,
      });
      console.log(`💾 Started background save for individual assortment data`);
    } catch (error) {
      console.error(`❌ Error saving individual assortment data:`, error);
      // Don't block navigation if saving fails
    }

    // Navigate immediately with assortment data in state for fast access
    navigate(`/packing-instruction/${assortment.itemNo}`, {
      state: { 
        assortmentData: assortment,
        sourceOrder: { id: salesOrderId },
        fromTable: true 
      }
    });
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <Card className="product-grid-item p-2 hover:shadow-lg transition-shadow duration-200">
        <div className="relative">
          {/* Placeholder image or first PCF image */}
          <CardImg
            src="/api/placeholder-image.jpg" // You might want to show first PCF image
            alt={assortment.itemNo}
            className="lazy"
            style={{
              maxWidth: '100%',
              maxHeight: '150px',
              display: 'block',
              margin: 'auto',
              objectFit: 'contain',
            }}
          />
          
          {/* Image count badge */}
          {assortment.webhookImageCount > 0 && (
            <div className="position-absolute top-0 end-0 m-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {assortment.webhookImageCount} images
              </span>
            </div>
          )}
        </div>
        
        <CardFooter className="p-0 d-flex flex-column text-center text-secondary">
          <span className="fs--1 fw-black text-blue-600">
            {assortment.customerItemNo} | {assortment.itemNo}
          </span>
          <span className="fs--1 text-limit" title={assortment.name}>
            {assortment.name}
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}