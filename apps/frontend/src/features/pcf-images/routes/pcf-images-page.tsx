import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { QUERY_KEYS } from '@/constant/query-key';
import {
  Assortment,
  UploadAssortmentImageDTO,
  uploadAssortmentImageSchema,
  useUploadAssortmentImage,
} from '@/features/assortments';
import { groupPCFImages } from '@/utils/pcf-util';
import { useTranslation } from 'react-i18next';
import { PcfImage } from '..';
import { ImageDropZone } from '../components/image-dropzone';
import { ImageDropZoneMulti } from '../components/image-dropzone-multi';

export interface PCFImagesPageProps<T extends Assortment> {
  assortment: T & { pcfImages: PcfImage[] };
}

// Custom Accordion Component using Tailwind
interface AccordionItemProps {
  eventKey: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionItem({ title, isOpen, onToggle, children }: AccordionItemProps) {
  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={onToggle}
        className="w-full text-left uppercase font-semibold py-3 px-4 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
      >
        <span>{title}</span>
        <Icons.UCaretRight 
          className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}
          width={16} 
          height={16} 
        />
      </button>
      {isOpen && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function PCFImagesPage<T extends Assortment>({
  assortment,
}: PCFImagesPageProps<T>) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // State for accordion sections (all open by default)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
  '0': true,
  '1': true,
  '2': true,
  '3': true,
  '4': true,
  '5': true,
});

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const form = useForm<UploadAssortmentImageDTO>({
    resolver: zodResolver(uploadAssortmentImageSchema),
    defaultValues: {
      _id: assortment._id,
      masterUccLabel: undefined,
      masterShippingMark: undefined,
      masterCarton: undefined,
      innerUccLabel: undefined,
      innerItemLabel: undefined,
      innerItemUccLabel: undefined,
      innerCarton: undefined,
      upcLabelFront: undefined,
      upcLabelBack: undefined,
      upcPlacement: [],
      productPictures: [],
      protectivePackaging: [],
    },
  });

  const { mutate, isPending } = useUploadAssortmentImage({
    onSuccess: (data) => {
      form.reset();
      queryClient.setQueryData([QUERY_KEYS.ASSORTMENTS, assortment._id], data);
      toast.success('Images saved successfully');
    },
  });

  const groupedImages = groupPCFImages(assortment?.pcfImages || []);

  function onSubmit(values: UploadAssortmentImageDTO) {
    mutate({ ...values, _id: assortment._id });
  }

  return (
    <Form {...form}>
      <div className="grid grid-cols-3 gap-4 items-left mb-4">
        <div></div>
        <div className="flex items-center justify-center">
          <a
            className="text-uppercase font-semibold text-sm text-blue-600 hover:text-blue-800 flex items-center"
            href={`/api/zulu-assortments/${assortment._id}/downloads`}
            target="_blank"
          >
            <Icons.ShareO1 width={16} height={16} />
            <span className="ml-2">{t(`keyButton_download.images`)}</span>
          </a>
        </div>
        <div className="flex justify-end">
          <Button
            variant={'primary'}
            type="button"
            disabled={isPending || !form.formState.isDirty}
            onClick={() => form.handleSubmit(onSubmit)()}
            className="flex items-center"
          >
            {isPending && (
              <Icons.LoaderSpinner
                height={16}
                width={16}
                className="custom-spinner"
              />
            )}
            <span className="ml-2">{t(`keyButton_savedImages`)}</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm px-4 py-1 mt-4">
        <AccordionItem
          eventKey="0"
          title={t('keyImageSection_masterCarton')}
          isOpen={openSections['0']}
          onToggle={() => toggleSection('0')}
        >
          <div className="flex flex-row items-center pt-2 space-x-4">
            <FormField
              control={form.control}
              name="masterUccLabel"
              render={({ field }) => (
                <ImageDropZone
                  label={t('keyImageType_uccLabel')}
                  {...field}
                  assortmentId={assortment._id}
                  groupPcfImages={groupedImages}
                />
              )}
            />
            <FormField
              control={form.control}
              name="masterShippingMark"
              render={({ field }) => (
                <ImageDropZone
                  label={t('keyImageType_shippingMark')}
                  {...field}
                  assortmentId={assortment._id}
                  groupPcfImages={groupedImages}
                />
              )}
            />
            <FormField
              control={form.control}
              name="masterCarton"
              render={({ field }) => (
                <ImageDropZone
                  label={t('keyImageType_masterCarton')}
                  {...field}
                  assortmentId={assortment._id}
                  groupPcfImages={groupedImages}
                />
              )}
            />
          </div>
        </AccordionItem>

        <AccordionItem
          eventKey="1"
          title={t('keyImageSection_innerCarton')}
          isOpen={openSections['1']}
          onToggle={() => toggleSection('1')}
        >
          <div className="flex flex-row items-center pt-2 space-x-4">
            <FormField
              control={form.control}
              name="innerItemLabel"
              render={({ field }) => (
                <ImageDropZone
                  label={t('keyImageType_itemLabel')}
                  {...field}
                  assortmentId={assortment._id}
                  groupPcfImages={groupedImages}
                />
              )}
            />
            <FormField
              control={form.control}
              name="innerUccLabel"
              render={({ field }) => (
                <ImageDropZone
                  label={t('keyImageType_uccLabel')}
                  {...field}
                  assortmentId={assortment._id}
                  groupPcfImages={groupedImages}
                />
              )}
            />
            <FormField
              control={form.control}
              name="innerItemUccLabel"
              render={({ field }) => (
                <ImageDropZone
                  label={t('keyImageType_uccItemLabel')}
                  {...field}
                  assortmentId={assortment._id}
                  groupPcfImages={groupedImages}
                />
              )}
            />
            <FormField
              control={form.control}
              name="innerCarton"
              render={({ field }) => (
                <ImageDropZone
                  label={t('keyImageType_innerCarton')}
                  {...field}
                  assortmentId={assortment._id}
                  groupPcfImages={groupedImages}
                />
              )}
            />
          </div>
        </AccordionItem>

        <AccordionItem
          eventKey="2"
          title={t('keyImageSection_upcLabel')}
          isOpen={openSections['2']}
          onToggle={() => toggleSection('2')}
        >
          <div className="flex flex-row items-center pt-2 space-x-4">
            <FormField
              control={form.control}
              name="upcLabelFront"
              render={({ field }) => (
                <ImageDropZone
                  label={t('keyImageType_frontUPCLabel')}
                  {...field}
                  assortmentId={assortment._id}
                  groupPcfImages={groupedImages}
                />
              )}
            />
            <FormField
              control={form.control}
              name="upcLabelBack"
              render={({ field }) => (
                <ImageDropZone
                  label={t('keyImageType_backUPCLabel')}
                  {...field}
                  assortmentId={assortment._id}
                  groupPcfImages={groupedImages}
                />
              )}
            />
          </div>
        </AccordionItem>

        <AccordionItem
          eventKey="3"
          title={t('keyImageSection_upcPlacement')}
          isOpen={openSections['3']}
          onToggle={() => toggleSection('3')}
        >
          <FormField
            control={form.control}
            name="upcPlacement"
            render={({ field }) => (
              <div className="pt-2">
                <ImageDropZoneMulti
                  {...field}
                  assortmentId={assortment._id}
                  groupPcfImages={groupedImages}
                />
              </div>
            )}
          />
        </AccordionItem>

        <AccordionItem
          eventKey="4"
          title={t('keyImageSection_product')}
          isOpen={openSections['4']}
          onToggle={() => toggleSection('4')}
        >
          <FormField
            control={form.control}
            name="productPictures"
            render={({ field }) => (
              <div className="pt-2">
                <ImageDropZoneMulti
                  {...field}
                  assortmentId={assortment._id}
                  groupPcfImages={groupedImages}
                />
              </div>
            )}
          />
        </AccordionItem>

        <AccordionItem
          eventKey="5"
          title={t('keyImageSection_protected')}
          isOpen={openSections['5']}
          onToggle={() => toggleSection('5')}
        >
          <FormField
            control={form.control}
            name="protectivePackaging"
            render={({ field }) => (
              <div className="pt-2">
                <ImageDropZoneMulti
                  {...field}
                  assortmentId={assortment._id}
                  groupPcfImages={groupedImages}
                />
              </div>
            )}
          />
        </AccordionItem>
      </div>
    </Form>
  );
}