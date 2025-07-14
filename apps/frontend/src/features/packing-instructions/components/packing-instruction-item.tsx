import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PCFImagesPage, PCFPreviewPage } from '@/features/pcf-images';
import { useGetWebhookAssortment } from '@/features/packing-instructions';

interface PackingInstructionItemProps {
  assortment: any; // Flexible type to handle different assortment structures
}

export function PackingInstructionItem({ assortment }: PackingInstructionItemProps) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultValue = searchParams.get('tab_view') || 'images';

  // ✅ SHARED DATA: Fetch webhook data once for both tabs
  const assortmentItemNo = assortment?.itemNo || (assortment as any)?.baseAssortment?.itemNo || '';
  const { data: freshMongoData } = useGetWebhookAssortment(
    assortmentItemNo,
    { enabled: !!assortmentItemNo, staleTime: 0, gcTime: 0, refetchOnMount: true, refetchOnWindowFocus: false }
  );

  // ✅ SHARED DATA: Process data once for both components
  const sharedData = useMemo(() => {
    const actualAssortment = freshMongoData || assortment;
    const assortmentId = 
      (actualAssortment as any)?.baseAssortment?.itemNo || 
      (actualAssortment as any)?.itemNo || 
      (actualAssortment as any)?._id || '';

    const currentWebhookImages = 
      (actualAssortment as any)?.baseAssortment?.webhookImages || 
      (actualAssortment as any)?.pcfImages;

    const currentUserMods = 
      (freshMongoData as any)?.userModifications || 
      (actualAssortment as any)?.userModifications || 
      null;

    // Calculate image statistics
    const getImageStats = () => {
      if (!currentWebhookImages && !currentUserMods?.uploadedImages) {
        return { 
          total: 0, 
          sections: 0, 
          itemPackSections: 0,
          webhookCounts: { itemPack: 0, barcode: 0, display: 0, inner: 0, master: 0 },
          userCounts: { itemPack: 0, barcode: 0, display: 0, inner: 0, master: 0 }
        };
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
        itemPackSections: currentWebhookImages?.itemPackImages?.length || 0,
        webhookCounts,
        userCounts
      };
    };

    return {
      actualAssortment,
      assortmentId,
      currentWebhookImages,
      currentUserMods,
      imageStats: getImageStats()
    };
  }, [freshMongoData, assortment]);

  function handleOnViewChange(value: string) {
    searchParams.set('tab_view', value);
    setSearchParams(searchParams);
  }

  // If assortment doesn't have the expected structure, show a message
  if (!assortment || !assortmentItemNo) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Assortment data is not properly loaded</p>
      </div>
    );
  }

  console.log('🔍 Packing Instruction - Shared data:', sharedData);

  return (
    <Tabs
      defaultValue={defaultValue}
      role="tablist"
      onValueChange={handleOnViewChange}
    >
      <TabsList className="border-bottom pb-1">
        <TabsTrigger value="images">
          {t(`keyButton_images`) || 'Images'}
          {sharedData.imageStats.total > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {sharedData.imageStats.total}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="preview">
          {t(`keyButton_preview`) || 'Preview'}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="images">
        {/* ✅ Pass the original assortment to PCFImagesPage - it handles its own data */}
        <PCFImagesPage assortment={sharedData.actualAssortment} />
      </TabsContent>
      
      <TabsContent value="preview">
        {/* ✅ Pass the processed shared data to PCFPreviewPage */}
        <PCFPreviewPage
          assortment={sharedData.actualAssortment}
          webhookImages={sharedData.currentWebhookImages}
          userModifications={sharedData.currentUserMods}
          imageStats={sharedData.imageStats}
          assortmentId={sharedData.assortmentId}
        />
      </TabsContent>
    </Tabs>
  );
}