import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PCFImagesPage, PCFPreviewPage } from '@/features/pcf-images';
import { AssortmentPCF } from '..';

interface AssortmentItemProps {
  assortment: AssortmentPCF;
}

export function AssortmentItem({ assortment }: AssortmentItemProps) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultValue = searchParams.get('tab_view') || 'images';

  function handleOnViewChange(value: string) {
    searchParams.set('tab_view', value);
    setSearchParams(searchParams);
  }

  return (
    <Tabs
      defaultValue={defaultValue}
      role="tablist"
      onValueChange={handleOnViewChange}
    >
      <TabsList className="border-bottom pb-1">
        <TabsTrigger value="images">{t(`keyButton_images`)}</TabsTrigger>
        <TabsTrigger value="preview">{t(`keyButton_preview`)}</TabsTrigger>
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
