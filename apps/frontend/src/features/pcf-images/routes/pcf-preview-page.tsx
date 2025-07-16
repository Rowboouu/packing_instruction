import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { PreviewPDFContainer, ReportButton } from '..';
import {
  useUpdateAssortment,
  useGetWebhookAssortment,
  AssortmentData,
} from '@/features/packing-instructions';

// ✅ UPDATED: Interface using only packing-instructions types
export interface PCFPreviewPageProps {
  assortment: any; // Flexible type to handle different input structures
  // Optional props for shared data from parent component
  webhookImages?: any;
  userModifications?: any;
  imageStats?: {
    total: number;
    sections: number;
    itemPackSections: number;
    webhookCounts?: any;
    userCounts?: any;
  };
  assortmentId?: string;
}

export function PCFPreviewPage({
  assortment,
  webhookImages,
  userModifications,
  imageStats,
  assortmentId,
}: PCFPreviewPageProps) {
  const { t } = useTranslation();
  const { mutate, isPending: isMutatePending } = useUpdateAssortment();

  // ✅ FLEXIBLE: Use passed props OR fetch data (backward compatibility)
  const fallbackAssortmentItemNo =
    (assortment as any)?.itemNo ||
    (assortment as any)?.baseAssortment?.itemNo ||
    (assortment as any)?._id ||
    '';

  const { data: freshWebhookData } = useGetWebhookAssortment(
    fallbackAssortmentItemNo,
    {
      enabled: !webhookImages && !!fallbackAssortmentItemNo, // Only fetch if not provided as props
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  );

  // ✅ SMART: Use provided props or fallback to fetched/existing data
  const actualAssortment = freshWebhookData || assortment;
  const actualAssortmentId =
    assortmentId ||
    (actualAssortment as any)?.baseAssortment?.itemNo ||
    (actualAssortment as any)?.itemNo ||
    (actualAssortment as any)?._id ||
    '';

  const actualWebhookImages =
    webhookImages ||
    (actualAssortment as any)?.baseAssortment?.webhookImages ||
    (actualAssortment as any)?.pcfImages;

  const actualUserMods =
    userModifications ||
    (freshWebhookData as any)?.userModifications ||
    (actualAssortment as any)?.userModifications ||
    null;

  console.log('🔍 PCF Preview - Using data:', {
    providedAsProps: !!webhookImages,
    webhookImages: actualWebhookImages,
    userMods: actualUserMods,
    imageStats,
    assortmentId: actualAssortmentId,
  });

  const handleApprovedClick = () => {
    try {
      // ✅ SIMPLIFIED: Create update payload without complex DTO
      const updatePayload = {
        _id: actualAssortmentId,
        userModifications: {
          formData: {
            status: 'approved',
          },
        },
        isWebhookData: true,
      };
      mutate(updatePayload as any);
      console.log(
        'Approval process initiated for assortment:',
        actualAssortmentId,
      );
    } catch (error) {
      console.error('Error updating assortment status:', error);
    }
  };

  // ✅ SMART: Use provided imageStats or calculate fallback
  const getImageStats = () => {
    if (imageStats) {
      console.log('🔍 Using provided imageStats:', imageStats);
      return imageStats;
    }

    console.log('🔍 Calculating imageStats from data...');

    if (!actualWebhookImages && !actualUserMods?.uploadedImages) {
      return {
        total: 0,
        sections: 0,
        itemPackSections: 0,
        webhookCounts: {
          itemPack: 0,
          barcode: 0,
          display: 0,
          inner: 0,
          master: 0,
        },
        userCounts: {
          itemPack: 0,
          barcode: 0,
          display: 0,
          inner: 0,
          master: 0,
          innerMark: 0,
          mainMark: 0,
          sideMark: 0,
        },
      };
    }

    const webhookCounts = {
      itemPack:
        actualWebhookImages?.itemPackImages?.reduce(
          (acc: number, packArray: any[]) => acc + packArray.length,
          0,
        ) || 0,
      barcode: actualWebhookImages?.itemBarcodeImages?.length || 0,
      display: actualWebhookImages?.displayImages?.length || 0,
      inner: actualWebhookImages?.innerCartonImages?.length || 0,
      master: actualWebhookImages?.masterCartonImages?.length || 0,
    };

    const userCounts = {
      itemPack: actualUserMods?.uploadedImages?.itemPackImages?.length || 0,
      barcode: actualUserMods?.uploadedImages?.itemBarcodeImages?.length || 0,
      display: actualUserMods?.uploadedImages?.displayImages?.length || 0,
      inner: actualUserMods?.uploadedImages?.innerCartonImages?.length || 0,
      master: actualUserMods?.uploadedImages?.masterCartonImages?.length || 0,
      innerMark:
        actualUserMods?.uploadedImages?.innerCartonShippingMarks?.length || 0,
      mainMark:
        actualUserMods?.uploadedImages?.masterCartonMainShippingMarks?.length ||
        0,
      sideMark:
        actualUserMods?.uploadedImages?.masterCartonSideShippingMarks?.length ||
        0,
    };

    const total =
      Object.values(webhookCounts).reduce((a, b) => a + b, 0) +
      Object.values(userCounts).reduce((a, b) => a + b, 0);

    const sections =
      (actualWebhookImages?.itemPackImages?.length || 0) +
      (webhookCounts.barcode + userCounts.barcode > 0 ? 1 : 0) +
      (webhookCounts.display + userCounts.display > 0 ? 1 : 0) +
      (webhookCounts.inner + userCounts.inner > 0 ? 1 : 0) +
      (webhookCounts.master + userCounts.master > 0 ? 1 : 0);

    return {
      total,
      sections,
      itemPackSections: actualWebhookImages?.itemPackImages?.length || 0,
      webhookCounts,
      userCounts,
    };
  };

  const calculatedImageStats = getImageStats();

  // ✅ TRANSFORM: Create data structure for PreviewPDFContainer
  const transformToAssortmentData = (): AssortmentData => {
    console.log('🔍 Preview Transform - Starting transformation...');

    if (!actualWebhookImages && !actualUserMods?.uploadedImages) {
      console.log('❌ Preview Transform - No data to transform');
      return {
        ...actualAssortment,
        pcfImages: [],
      } as unknown as AssortmentData;
    }

    const previewData = {
      // ✅ Final Product Images: Last image from each itemPack array
      finalProductImages:
        actualWebhookImages?.itemPackImages
          ?.map((packArray: any[]) => {
            console.log(
              '🔍 Processing pack array for final product:',
              packArray,
            );
            return packArray[packArray.length - 1];
          })
          .filter(Boolean) || [],

      // ✅ How to Pack Single Product: ItemPack arrays with '+' and '=' formatting
      howToPackSingleProduct:
        actualWebhookImages?.itemPackImages?.map(
          (packArray: any[], index: number) => ({
            rowIndex: index,
            images: packArray,
            // Format: img1 + img2 + img3 = final
            displayFormat: packArray.map((img: any, i: number) => ({
              image: img,
              separator: i === packArray.length - 1 ? '=' : '+',
              isLast: i === packArray.length - 1,
            })),
          }),
        ) || [],

      // ✅ Barcode Images: Direct from webhook + user uploads
      barcodeImages: [
        ...(actualWebhookImages?.itemBarcodeImages || []),
        ...(actualUserMods?.uploadedImages?.itemBarcodeImages?.map(
          (file: any) => ({
            id: Math.random(),
            componentName: file.originalname,
            image: `/webhook/pcf-images/${file.filename}`,
            filename: file.filename,
            isUserUpload: true,
          }),
        ) || []),
      ],

      // ✅ Display Images: Direct from webhook + user uploads
      displayImages: [
        ...(actualWebhookImages?.displayImages || []),
        ...(actualUserMods?.uploadedImages?.displayImages?.map((file: any) => ({
          id: Math.random(),
          componentName: file.originalname,
          image: `/webhook/pcf-images/${file.filename}`,
          filename: file.filename,
          isUserUpload: true,
        })) || []),
      ],

      // ✅ Display Packing: DisplayImages with '+' and '=' formatting
      displayPacking: {
        images: [
          ...(actualWebhookImages?.displayImages || []),
          ...(actualUserMods?.uploadedImages?.displayImages?.map(
            (file: any) => ({
              id: Math.random(),
              componentName: file.originalname,
              image: `/webhook/pcf-images/${file.filename}`,
              filename: file.filename,
              isUserUpload: true,
            }),
          ) || []),
        ],
        displayFormat: function () {
          return this.images.map((img, i) => ({
            image: img,
            separator: i === this.images.length - 1 ? '=' : '+',
            isLast: i === this.images.length - 1,
          }));
        },
      },

      // ✅ Inner Carton Images: Direct from webhook + user uploads
      innerCartonImages: [
        ...(actualWebhookImages?.innerCartonImages || []),
        ...(actualUserMods?.uploadedImages?.innerCartonImages?.map(
          (file: any) => ({
            id: Math.random(),
            componentName: file.originalname,
            image: `/webhook/pcf-images/${file.filename}`,
            filename: file.filename,
            isUserUpload: true,
          }),
        ) || []),
      ],

      // ✅ Inner Carton Packing: InnerCarton images with dimensions
      innerCartonPacking: {
        images: [
          ...(actualWebhookImages?.innerCartonImages || []),
          ...(actualUserMods?.uploadedImages?.innerCartonImages?.map(
            (file: any) => ({
              id: Math.random(),
              componentName: file.originalname,
              image: `/webhook/pcf-images/${file.filename}`,
              filename: file.filename,
              isUserUpload: true,
            }),
          ) || []),
        ],
        dimensions: {
          length:
            (actualAssortment as any)?.baseAssortment?.innerCartonLength ||
            (actualAssortment as any)?.innerCartonLength ||
            0,
          width:
            (actualAssortment as any)?.baseAssortment?.innerCartonWidth ||
            (actualAssortment as any)?.innerCartonWidth ||
            0,
          height:
            (actualAssortment as any)?.baseAssortment?.innerCartonHeight ||
            (actualAssortment as any)?.innerCartonHeight ||
            0,
        },
        displayFormat: function () {
          return this.images.map((img, i) => ({
            image: img,
            separator: i === this.images.length - 1 ? '=' : '+',
            isLast: i === this.images.length - 1,
          }));
        },
      },

      // ✅ Master Carton Images: Direct from webhook + user uploads
      masterCartonImages: [
        ...(actualWebhookImages?.masterCartonImages || []),
        ...(actualUserMods?.uploadedImages?.masterCartonImages?.map(
          (file: any) => ({
            id: Math.random(),
            componentName: file.originalname,
            image: `/webhook/pcf-images/${file.filename}`,
            filename: file.filename,
            isUserUpload: true,
          }),
        ) || []),
      ],

      // ✅ Master Carton Pack: MasterCarton images with dimensions
      masterCartonPack: {
        images: [
          ...(actualWebhookImages?.masterCartonImages || []),
          ...(actualUserMods?.uploadedImages?.masterCartonImages?.map(
            (file: any) => ({
              id: Math.random(),
              componentName: file.originalname,
              image: `/webhook/pcf-images/${file.filename}`,
              filename: file.filename,
              isUserUpload: true,
            }),
          ) || []),
        ],
        dimensions: {
          length:
            (actualAssortment as any)?.baseAssortment?.masterCartonLength ||
            (actualAssortment as any)?.masterCartonLength ||
            0,
          width:
            (actualAssortment as any)?.baseAssortment?.masterCartonWidth ||
            (actualAssortment as any)?.masterCartonWidth ||
            0,
          height:
            (actualAssortment as any)?.baseAssortment?.masterCartonHeight ||
            (actualAssortment as any)?.masterCartonHeight ||
            0,
        },
        displayFormat: function () {
          return this.images.map((img, i) => ({
            image: img,
            separator: i === this.images.length - 1 ? '=' : '+',
            isLast: i === this.images.length - 1,
          }));
        },
      },

      // ✅ Inner Carton/Pack Mark: From user uploaded shipping marks
      innerCartonPackMark: [
        ...(actualUserMods?.uploadedImages?.innerCartonShippingMarks?.map(
          (file: any) => ({
            id: Math.random(),
            componentName: file.originalname,
            image: `/webhook/pcf-images/${file.filename}`,
            filename: file.filename,
            isUserUpload: true,
          }),
        ) || []),
      ],

      // ✅ Main Shipping Mark: From user uploaded master carton marks
      mainShippingMark: [
        ...(actualUserMods?.uploadedImages?.masterCartonMainShippingMark?.map(
          (file: any) => ({
            id: Math.random(),
            componentName: file.originalname,
            image: `/webhook/pcf-images/${file.filename}`,
            filename: file.filename,
            isUserUpload: true,
          }),
        ) || []),
      ],

      // ✅ Side Shipping Mark: From user uploaded master carton marks
      sideShippingMark: [
        ...(actualUserMods?.uploadedImages?.masterCartonSideShippingMarks?.map(
          (file: any) => ({
            id: Math.random(),
            componentName: file.originalname,
            image: `/webhook/pcf-images/${file.filename}`,
            filename: file.filename,
            isUserUpload: true,
          }),
        ) || []),
      ],
    };

    console.log('🔍 Preview Transform - Final preview data:', previewData);

    return {
      ...actualAssortment,
      pcfImages: previewData,
    } as unknown as AssortmentData;
  };

  const hasImages = calculatedImageStats.total > 0;
  const isApproved = (actualAssortment as any)?.status === 'approved';

  return (
    <>
      <div className="grid grid-cols-6 items-center justify-between">
        {/* Left column - empty spacer */}
        <div className="grid col-span-1"></div>

        {/* Center column - Action buttons */}
        <div className="grid col-span-4">
          <div className="flex items-center justify-center gap-6">
            <ReportButton
              itemId={actualAssortmentId}
              itemType="item"
              reportType="pdf"
            >
              <div className="flex items-center">
                <Icons.ShareO1 width={16} height={16} />
                <span className="ml-2">
                  {String(t('keyButton_download.pdfForm'))}
                </span>
              </div>
            </ReportButton>

            <ReportButton
              itemId={actualAssortmentId}
              itemType="item"
              reportType="excel"
            >
              <div className="flex items-center">
                <Icons.ShareO1 width={16} height={16} />
                <span className="ml-2">
                  {String(t('keyButton_download.excelForm'))}
                </span>
              </div>
            </ReportButton>

            <ReportButton
              itemId={actualAssortmentId}
              itemType="item"
              reportType="pdf"
            >
              <div className="flex items-center">
                <Icons.ShareO1 width={16} height={16} />
                <span className="ml-2">
                  {String(t('keyButton_download.pdfSharepoint'))}
                </span>
              </div>
            </ReportButton>

            <ReportButton
              itemId={actualAssortmentId}
              itemType="item"
              reportType="excel"
            >
              <div className="flex items-center">
                <Icons.ShareO1 width={16} height={16} />
                <span className="ml-2">
                  {String(t('keyButton_download.excelSharepoint'))}
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
                {String(
                  isApproved
                    ? t('keyButton_approved')
                    : t('keyButton_approved'),
                )}
              </span>
            </div>
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-4 overflow-hidden flex justify-center bg-white p-5 rounded-xl">
        {hasImages ? (
          <PreviewPDFContainer assortment={transformToAssortmentData()} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Icons.ShareO1 width={48} height={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Images Available</h3>
            <p className="text-sm text-center max-w-md">
              No PCF images have been uploaded for this assortment yet. Upload
              images in the PCF Images section to generate a preview.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
