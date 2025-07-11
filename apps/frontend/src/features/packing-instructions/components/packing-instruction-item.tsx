import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PCFImagesPage, PCFPreviewPage } from '@/features/pcf-images';

interface PackingInstructionItemProps {
  assortment: any; // More flexible type to handle different assortment structures
}

export function PackingInstructionItem({ assortment }: PackingInstructionItemProps) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultValue = searchParams.get('tab_view') || 'images';

  function handleOnViewChange(value: string) {
    searchParams.set('tab_view', value);
    setSearchParams(searchParams);
  }

  // If assortment doesn't have the expected structure, show a message
  if (!assortment || !assortment.itemNo) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Assortment data is not properly loaded</p>
      </div>
    );
  }

  return (
    <Tabs
      defaultValue={defaultValue}
      role="tablist"
      onValueChange={handleOnViewChange}
    >
      <TabsList className="border-bottom pb-1">
        <TabsTrigger value="images">{t(`keyButton_images`) || 'Images'}</TabsTrigger>
        <TabsTrigger value="preview">{t(`keyButton_preview`) || 'Preview'}</TabsTrigger>
      </TabsList>
      <TabsContent value="images">
        <PCFImagesPage assortment={assortment} />
      </TabsContent>
      <TabsContent value="preview">
        <PCFPreviewPage assortment={assortment} />
      </TabsContent>
    </Tabs>
  );
}