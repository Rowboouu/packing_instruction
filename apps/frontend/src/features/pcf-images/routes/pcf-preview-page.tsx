// SIMPLIFIED pcf-preview-page.tsx - Use existing data structure

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Assortment, AssortmentPCF } from '@/features/assortments';
import { useTranslation } from 'react-i18next';
import { PreviewPDFContainer, ReportButton } from '..';
import { useUpdateAssortment } from '@/features/packing-instructions';
import { useGetWebhookAssortment } from '@/features/packing-instructions';

export interface PCFPreviewPageProps<T extends Assortment> {
  assortment: T & {
    pcfImages?: any;
    status?: string;
  };
}

export function PCFPreviewPage<T extends Assortment>({
  assortment,
}: PCFPreviewPageProps<T>) {
  const { t } = useTranslation();
  const { mutate, isPending: isMutatePending } = useUpdateAssortment();
  
  // ✅ SIMPLE: Get the same data structure used in pcf-images-page
  const assortmentItemNo = 
    (assortment as any)?.itemNo || 
    (assortment as any)?.baseAssortment?.itemNo || 
    (assortment as any)?._id || '';
    
  const { data: freshMongoData } = useGetWebhookAssortment(
    assortmentItemNo,
    { enabled: !!assortmentItemNo, staleTime: 0, gcTime: 0, refetchOnMount: true, refetchOnWindowFocus: false }
  );
  
  // ✅ SIMPLE: Use the same logic as pcf-images-page
  const actualAssortment = freshMongoData || assortment;
  const assortmentId = 
    (actualAssortment as any)?.baseAssortment?.itemNo || 
    (actualAssortment as any)?.itemNo || 
    (actualAssortment as any)?._id || '';

  const handleApprovedClick = () => {
    try {
      mutate({ 
        _id: assortmentId,
      } as any);
      console.log('Approval process initiated for assortment:', assortmentId);
    } catch (error) {
      console.error('Error updating assortment status:', error);
    }
  };

  // ✅ SIMPLE: Extract data the same way as pcf-images-page
  const currentWebhookImages = 
    (actualAssortment as any)?.baseAssortment?.webhookImages || 
    (actualAssortment as any)?.pcfImages;
  const currentUserMods = 
    (freshMongoData as any)?.userModifications || 
    (actualAssortment as any)?.userModifications || 
    null;

  // ✅ SIMPLE: Calculate image statistics like pcf-images-page
  const getImageStats = () => {
    if (!currentWebhookImages && !currentUserMods?.uploadedImages) {
      return { total: 0, sections: 0, hasImages: false };
    }

    const webhookCounts = {
      itemPack: currentWebhookImages?.itemPackImages?.reduce((acc: number, packArray: any[]) => acc + packArray.length, 0) || 0,
      barcode: currentWebhookImages?.itemBarcodeImages?.length || 0,
      display: currentWebhookImages?.displayImages?.length || 0,
      inner: currentWebhookImages?.innerCartonImages?.length || 0,
      master: currentWebhookImages?.masterCartonImages?.length || 0,
    };

    const userCounts = {
      itemPack: currentUserMods?.uploadedImages?.itemPackImages?.length || 0,
      barcode: currentUserMods?.uploadedImages?.itemBarcodeImages?.length || 0,
      display: currentUserMods?.uploadedImages?.displayImages?.length || 0,
      inner: currentUserMods?.uploadedImages?.innerCartonImages?.length || 0,
      master: currentUserMods?.uploadedImages?.masterCartonImages?.length || 0,
    };
    
    const total = Object.values(webhookCounts).reduce((a, b) => a + b, 0) + 
                  Object.values(userCounts).reduce((a, b) => a + b, 0);
    
    const sections = (currentWebhookImages?.itemPackImages?.length || 0) + 
      ((webhookCounts.barcode + userCounts.barcode) > 0 ? 1 : 0) + 
      ((webhookCounts.display + userCounts.display) > 0 ? 1 : 0) + 
      ((webhookCounts.inner + userCounts.inner) > 0 ? 1 : 0) + 
      ((webhookCounts.master + userCounts.master) > 0 ? 1 : 0);

    return { 
      total, 
      sections, 
      hasImages: total > 0,
      itemPackSections: currentWebhookImages?.itemPackImages?.length || 0,
      webhookCounts,
      userCounts
    };
  };

  // ✅ SIMPLE: Transform data for PreviewPDFContainer using actual structure
  const transformToAssortmentPCF = (): AssortmentPCF => {
    console.log('🔍 Preview Transform - Webhook images:', currentWebhookImages);
    console.log('🔍 Preview Transform - User mods:', currentUserMods);
    
    // Create the data structure that PreviewPDFContainer expects
    const previewData = {
      // ✅ Final Product Images: Last image from each itemPack array
      finalProductImages: currentWebhookImages?.itemPackImages?.map((packArray: any[]) => 
        packArray[packArray.length - 1]
      ).filter(Boolean) || [],

      // ✅ How to Pack: All itemPack arrays formatted
      howToPackSingleProduct: currentWebhookImages?.itemPackImages?.map((packArray: any[], index: number) => ({
        rowIndex: index,
        images: packArray,
        formattedDisplay: packArray.map((img: any, i: number) => ({
          image: img,
          separator: i === packArray.length - 1 ? '=' : '+',
          isLast: i === packArray.length - 1
        }))
      })) || [],

      // ✅ Barcode Images: Direct from webhook + user uploads
      barcodeImages: [
        ...(currentWebhookImages?.itemBarcodeImages || []),
        ...(currentUserMods?.uploadedImages?.itemBarcodeImages?.map((file: any) => ({
          id: Math.random(),
          componentName: file.originalname,
          image: `/webhook/pcf-images/${file.filename}`,
          filename: file.filename,
          isUserUpload: true
        })) || [])
      ],

      // ✅ Display Images: Direct from webhook + user uploads
      displayImages: [
        ...(currentWebhookImages?.displayImages || []),
        ...(currentUserMods?.uploadedImages?.displayImages?.map((file: any) => ({
          id: Math.random(),
          componentName: file.originalname,
          image: `/webhook/pcf-images/${file.filename}`,
          filename: file.filename,
          isUserUpload: true
        })) || [])
      ],

      // ✅ Inner Carton Images: Direct from webhook + user uploads
      innerCartonImages: [
        ...(currentWebhookImages?.innerCartonImages || []),
        ...(currentUserMods?.uploadedImages?.innerCartonImages?.map((file: any) => ({
          id: Math.random(),
          componentName: file.originalname,
          image: `/webhook/pcf-images/${file.filename}`,
          filename: file.filename,
          isUserUpload: true
        })) || [])
      ],

      // ✅ Master Carton Images: Direct from webhook + user uploads
      masterCartonImages: [
        ...(currentWebhookImages?.masterCartonImages || []),
        ...(currentUserMods?.uploadedImages?.masterCartonImages?.map((file: any) => ({
          id: Math.random(),
          componentName: file.originalname,
          image: `/webhook/pcf-images/${file.filename}`,
          filename: file.filename,
          isUserUpload: true
        })) || [])
      ],

      // ✅ Shipping Marks: Find from user uploads by filename pattern
      shippingMarks: {
        innerCartonMark: currentUserMods?.uploadedImages?.innerCartonImages?.find((file: any) => 
          file.originalname.toLowerCase().includes('shipping') || 
          file.originalname.toLowerCase().includes('mark')
        ),
        mainShippingMark: currentUserMods?.uploadedImages?.masterCartonImages?.find((file: any) => 
          file.originalname.toLowerCase().includes('main') && 
          file.originalname.toLowerCase().includes('shipping')
        ),
        sideShippingMark: currentUserMods?.uploadedImages?.masterCartonImages?.find((file: any) => 
          file.originalname.toLowerCase().includes('side') && 
          file.originalname.toLowerCase().includes('shipping')
        )
      }
    };

    console.log('🔍 Preview Transform - Final preview data:', previewData);

    return {
      ...actualAssortment,
      pcfImages: previewData
    } as unknown as AssortmentPCF;
  };

  const imageStats = getImageStats();
  const isApproved = (actualAssortment as any)?.status === 'approved';

  console.log('🔍 PCF Preview - Image stats:', imageStats);
  console.log('🔍 PCF Preview - Has images:', imageStats.hasImages);

  return (
    <>
      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <strong>Debug:</strong> Total images: {imageStats.total}, 
          Webhook: {!!currentWebhookImages ? 'Yes' : 'No'}, 
          UserMods: {!!currentUserMods ? 'Yes' : 'No'}
        </div>
      )}

      {/* Enhanced Header with detailed statistics */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex gap-6">
            <span>Total Images: <strong>{imageStats.total}</strong></span>
            <span>Active Sections: <strong>{imageStats.sections}</strong></span>
            <span>Item Pack Groups: <strong>{imageStats.itemPackSections}</strong></span>
            {currentUserMods && imageStats.userCounts && (
              <span className="text-blue-600">
                User Uploads: <strong>{Object.values(imageStats.userCounts).reduce((a, b) => a + b, 0)}</strong>
              </span>
            )}
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
              itemId={assortmentId}
              itemType="item"
              reportType="pdf"
            >
              <div className="flex items-center">
                <Icons.ShareO1 width={16} height={16} />
                <span className="ml-2">{t(`keyButton_download.pdfForm`)}</span>
              </div>
            </ReportButton>

            <ReportButton
              itemId={assortmentId}
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
              itemId={assortmentId}
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
              itemId={assortmentId}
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
        {imageStats.hasImages ? (
          <PreviewPDFContainer
            assortment={transformToAssortmentPCF()}
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

      {/* Enhanced Image Breakdown Section */}
      {imageStats.hasImages && imageStats.webhookCounts && imageStats.userCounts && (
        <div className="mt-6 grid grid-cols-5 gap-4">
          {(imageStats.webhookCounts.itemPack + imageStats.userCounts.itemPack) > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {imageStats.webhookCounts.itemPack + imageStats.userCounts.itemPack}
              </div>
              <div className="text-sm text-blue-800">Item Pack Images</div>
              <div className="text-xs text-blue-600 mt-1">
                {imageStats.itemPackSections} groups
                {imageStats.userCounts.itemPack > 0 && (
                  <span className="block">+ {imageStats.userCounts.itemPack} user uploads</span>
                )}
              </div>
            </div>
          )}
          
          {(imageStats.webhookCounts.barcode + imageStats.userCounts.barcode) > 0 && (
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {imageStats.webhookCounts.barcode + imageStats.userCounts.barcode}
              </div>
              <div className="text-sm text-green-800">Barcode Images</div>
              {imageStats.userCounts.barcode > 0 && (
                <div className="text-xs text-green-600 mt-1">
                  + {imageStats.userCounts.barcode} user uploads
                </div>
              )}
            </div>
          )}
          
          {(imageStats.webhookCounts.display + imageStats.userCounts.display) > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {imageStats.webhookCounts.display + imageStats.userCounts.display}
              </div>
              <div className="text-sm text-purple-800">Display Images</div>
              {imageStats.userCounts.display > 0 && (
                <div className="text-xs text-purple-600 mt-1">
                  + {imageStats.userCounts.display} user uploads
                </div>
              )}
            </div>
          )}
          
          {(imageStats.webhookCounts.inner + imageStats.userCounts.inner) > 0 && (
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {imageStats.webhookCounts.inner + imageStats.userCounts.inner}
              </div>
              <div className="text-sm text-orange-800">Inner Carton Images</div>
              {imageStats.userCounts.inner > 0 && (
                <div className="text-xs text-orange-600 mt-1">
                  + {imageStats.userCounts.inner} user uploads
                </div>
              )}
            </div>
          )}
          
          {(imageStats.webhookCounts.master + imageStats.userCounts.master) > 0 && (
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {imageStats.webhookCounts.master + imageStats.userCounts.master}
              </div>
              <div className="text-sm text-red-800">Master Carton Images</div>
              {imageStats.userCounts.master > 0 && (
                <div className="text-xs text-red-600 mt-1">
                  + {imageStats.userCounts.master} user uploads
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}