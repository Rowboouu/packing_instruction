import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Assortment, AssortmentPCF } from '@/features/assortments';
import { useTranslation } from 'react-i18next';
import { PreviewPDFContainer, ReportButton } from '..';
import { useUpdateAssortment } from '@/features/packing-instructions';

// Interface matching the Odoo webhook payload structure
interface OdooPcfImage {
  id: number;
  componentName: string;
  image: string; // Base64 encoded
  filename: string;
}

interface OdooPcfImages {
  itemPackImages: OdooPcfImage[][];
  itemBarcodeImages: OdooPcfImage[];
  displayImages: OdooPcfImage[];
  innerCartonImages: OdooPcfImage[];
  masterCartonImages: OdooPcfImage[];
}

export interface PCFPreviewPageProps<T extends Assortment> {
  assortment: T & {
    pcfImages?: OdooPcfImages;
    status?: string;
  };
}

export function PCFPreviewPage<T extends Assortment>({
  assortment,
}: PCFPreviewPageProps<T>) {
  const { t } = useTranslation();
  const { mutate, isPending: isMutatePending } = useUpdateAssortment();

  // Type guard for assortment with pcfImages
  const assortmentWithImages = assortment as T & { pcfImages?: OdooPcfImages; status?: string };

  const handleApprovedClick = () => {
    // Check if the assortment has a status property and if the mutation supports it
    if ('status' in assortmentWithImages) {
      try {
        // Attempt to update with status - you may need to adjust this based on your actual API
        mutate({ 
          _id: assortmentWithImages._id, 
          // Add other required fields for your update mutation
          // status: 'approved' 
        } as any);
        console.log('Approval process initiated for assortment:', assortmentWithImages._id);
      } catch (error) {
        console.error('Error updating assortment status:', error);
      }
    } else {
      console.log('Status update not supported or assortment missing status property');
    }
  };

  // Helper function to transform Odoo structure to AssortmentPCF format
  const transformToAssortmentPCF = (assortment: T): AssortmentPCF => {
    const pcfImages = assortmentWithImages.pcfImages;
    
    if (!pcfImages) {
      // Return assortment with empty pcfImages array if no images
      return {
        ...assortment,
        pcfImages: []
      } as unknown as AssortmentPCF;
    }

    // Flatten all image arrays into a single array for compatibility
    const allImages: OdooPcfImage[] = [
      ...(pcfImages.itemPackImages?.flatMap((packArray: OdooPcfImage[]) => packArray) || []),
      ...(pcfImages.itemBarcodeImages || []),
      ...(pcfImages.displayImages || []),
      ...(pcfImages.innerCartonImages || []),
      ...(pcfImages.masterCartonImages || [])
    ];

    // Transform Odoo images to the format expected by PreviewPDFContainer
    const transformedImages = allImages.map((odooImage) => ({
      id: odooImage.id,
      componentName: odooImage.componentName,
      image: odooImage.image,
      filename: odooImage.filename,
      // Add any other properties required by your PcfImage interface
    }));

    return {
      ...assortment,
      pcfImages: transformedImages
    } as unknown as AssortmentPCF;
  };

  // Calculate image statistics for display
  const getImageStats = () => {
    const pcfImages = assortmentWithImages.pcfImages;
    if (!pcfImages) return { total: 0, sections: 0 };

    const itemPackCount = pcfImages.itemPackImages?.reduce(
      (acc, packArray) => acc + packArray.length, 0
    ) || 0;
    const barcodeCount = pcfImages.itemBarcodeImages?.length || 0;
    const displayCount = pcfImages.displayImages?.length || 0;
    const innerCount = pcfImages.innerCartonImages?.length || 0;
    const masterCount = pcfImages.masterCartonImages?.length || 0;
    
    const total = itemPackCount + barcodeCount + displayCount + innerCount + masterCount;
    const sections = (pcfImages.itemPackImages?.length || 0) + 
      (barcodeCount > 0 ? 1 : 0) + 
      (displayCount > 0 ? 1 : 0) + 
      (innerCount > 0 ? 1 : 0) + 
      (masterCount > 0 ? 1 : 0);

    return { total, sections, itemPackSections: pcfImages.itemPackImages?.length || 0 };
  };

  const imageStats = getImageStats();
  const isApproved = assortmentWithImages.status === 'approved';

  return (
    <>
      {/* Header with image statistics */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex gap-6">
            <span>Total Images: <strong>{imageStats.total}</strong></span>
            <span>Active Sections: <strong>{imageStats.sections}</strong></span>
            <span>Item Pack Groups: <strong>{imageStats.itemPackSections}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              isApproved 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isApproved ? 'Approved' : 'Pending Review'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 items-center justify-between">
        {/* Left column - empty spacer */}
        <div className="grid col-span-1"></div>

        {/* Center column - Action buttons */}
        <div className="grid col-span-4">
          <div className="flex items-center justify-center gap-6">
            <ReportButton
              itemId={assortment._id}
              itemType="item"
              reportType="pdf"
            >
              <div className="flex items-center">
                <Icons.ShareO1 width={16} height={16} />
                <span className="ml-2">{t(`keyButton_download.pdfForm`)}</span>
              </div>
            </ReportButton>

            <ReportButton
              itemId={assortment._id}
              itemType="item"
              reportType="excel"
            >
              <div className="flex items-center">
                <Icons.ShareO1 width={16} height={16} />
                <span className="ml-2">
                  {t(`keyButton_download.excelForm`)}
                </span>
              </div>
            </ReportButton>
            
            <ReportButton
              itemId={assortment._id}
              itemType="item"
              reportType="pdf"
            >
              <div className="flex items-center">
                <Icons.ShareO1 width={16} height={16} />
                <span className="ml-2">
                  {t(`keyButton_download.pdfSharepoint`)}
                </span>
              </div>
            </ReportButton>

            <ReportButton
              itemId={assortment._id}
              itemType="item"
              reportType="excel"
            >
              <div className="flex items-center">
                <Icons.ShareO1 width={16} height={16} />
                <span className="ml-2">
                  {t(`keyButton_download.excelSharepoint`)}
                </span>
              </div>
            </ReportButton>
          </div>
        </div>

        {/* Right column - Approve button */}
        <div className="grid col-span-1 items-center justify-end">
          <Button
            variant={isApproved ? 'secondary' : 'success'}
            onClick={handleApprovedClick}
            disabled={isApproved || isMutatePending}
            className="flex items-center"
          >
            <div className="flex items-center">
              {isMutatePending ? (
                <Icons.LoaderSpinner
                  height={16}
                  width={16}
                  className="custom-spinner"
                />
              ) : isApproved ? (
                <Icons.UCheck width={16} height={16} />
              ) : (
                <Icons.UCheck width={16} height={16} />
              )}
              <span className="ml-2">
                {isApproved ? t(`keyButton_approved`) : t(`keyButton_approved`)}
              </span>
            </div>
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-4 overflow-hidden flex justify-center bg-white p-5 rounded-xl">
        {imageStats.total > 0 ? (
          <PreviewPDFContainer
            assortment={transformToAssortmentPCF(assortment)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Icons.ShareO1 width={48} height={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Images Available</h3>
            <p className="text-sm text-center max-w-md">
              No PCF images have been uploaded for this assortment yet. 
              Upload images in the PCF Images section to generate a preview.
            </p>
          </div>
        )}
      </div>

      {/* Image Breakdown Section */}
      {imageStats.total > 0 && (
        <div className="mt-6 grid grid-cols-5 gap-4">
          {assortmentWithImages.pcfImages?.itemPackImages && assortmentWithImages.pcfImages.itemPackImages.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {assortmentWithImages.pcfImages.itemPackImages.reduce((acc, pack) => acc + pack.length, 0)}
              </div>
              <div className="text-sm text-blue-800">Item Pack Images</div>
              <div className="text-xs text-blue-600 mt-1">
                {assortmentWithImages.pcfImages.itemPackImages.length} groups
              </div>
            </div>
          )}
          
          {assortmentWithImages.pcfImages?.itemBarcodeImages && assortmentWithImages.pcfImages.itemBarcodeImages.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {assortmentWithImages.pcfImages.itemBarcodeImages.length}
              </div>
              <div className="text-sm text-green-800">Barcode Images</div>
            </div>
          )}
          
          {assortmentWithImages.pcfImages?.displayImages && assortmentWithImages.pcfImages.displayImages.length > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {assortmentWithImages.pcfImages.displayImages.length}
              </div>
              <div className="text-sm text-purple-800">Display Images</div>
            </div>
          )}
          
          {assortmentWithImages.pcfImages?.innerCartonImages && assortmentWithImages.pcfImages.innerCartonImages.length > 0 && (
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {assortmentWithImages.pcfImages.innerCartonImages.length}
              </div>
              <div className="text-sm text-orange-800">Inner Carton Images</div>
            </div>
          )}
          
          {assortmentWithImages.pcfImages?.masterCartonImages && assortmentWithImages.pcfImages.masterCartonImages.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {assortmentWithImages.pcfImages.masterCartonImages.length}
              </div>
              <div className="text-sm text-red-800">Master Carton Images</div>
            </div>
          )}
        </div>
      )}
    </>
  );
}