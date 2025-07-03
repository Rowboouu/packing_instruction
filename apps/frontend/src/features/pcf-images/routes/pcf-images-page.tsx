import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { QUERY_KEYS } from '@/constant/query-key';
import {
  Assortment,
  UploadAssortmentImageDTO,
  uploadAssortmentImageSchema,
  useUploadAssortmentImage,
} from '@/features/assortments';
// import { groupPCFImages } from '@/utils/pcf-util';
import { useTranslation } from 'react-i18next';
import { PcfImage } from '..';
import { GridImageSection } from '../components/grid-image-section';

export interface PCFImagesPageProps<T extends Assortment> {
  assortment: T & { pcfImages: PcfImage[] };
}

interface GridImageItem {
  id: string;
  file?: File;
  pcfImage?: PcfImage;
  label: string;
  isUploadSlot?: boolean;
  isRequired?: boolean;
  placeholder?: string;
}

interface ItemPackSection {
  id: string;
  title: string;
  items: GridImageItem[];
}

// Custom Accordion Component using Tailwind
interface AccordionItemProps {
  eventKey: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionItem({
  title,
  isOpen,
  onToggle,
  children,
}: AccordionItemProps) {
  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={onToggle}
        className="w-full text-left uppercase font-semibold py-3 px-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex justify-between items-center rounded-t-md"
      >
        <span>{title}</span>
        <Icons.UCaretRight
          className={`transform transition-transform duration-300 ${
            isOpen ? 'rotate-90' : 'rotate-0'
          }`}
          width={16}
          height={16}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4">{children}</div>
      </div>
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
  });

  // State for Item Pack sections
  const [itemPackSections, setItemPackSections] = useState<ItemPackSection[]>([
    {
      id: 'item-pack-1',
      title: 'ITEM 1 PACK',
      items: [
        { id: 'item1-1', label: 'Design 1 - Product', isUploadSlot: false },
        { id: 'item1-2', label: 'Packaging', isUploadSlot: false },
        { id: 'item1-3', label: 'Final Image', isUploadSlot: false },
      ],
    },
    {
      id: 'item-pack-2',
      title: 'ITEM 2 PACK',
      items: [
        { id: 'item2-1', label: 'Design 2 - Product', isUploadSlot: false },
        { id: 'item2-2', label: 'Packaging', isUploadSlot: false },
        { id: 'item2-3', label: 'Final Image', isUploadSlot: false },
      ],
    },
  ]);

  // State for each section's items
  const [itemBarcodeItems, setItemBarcodeItems] = useState<GridImageItem[]>([
    { id: 'barcode-1', label: 'Barcode', isUploadSlot: false },
  ]);

  const [displayItems, setDisplayItems] = useState<GridImageItem[]>([
    { id: 'display-1', label: 'Final Image', isUploadSlot: false },
    { id: 'display-2', label: 'Final Image', isUploadSlot: false },
    { id: 'display-3', label: 'Final Image', isUploadSlot: false },
    { id: 'display-4', label: 'Final Image', isUploadSlot: false },
    { id: 'display-5', label: 'Packaging', isUploadSlot: false },
  ]);

  const [innerCartonItems, setInnerCartonItems] = useState<GridImageItem[]>([
    { id: 'inner-1', label: '1 Display', isUploadSlot: false },
    { id: 'inner-2', label: 'Final Image', isUploadSlot: false },
    { id: 'inner-3', label: 'Packaging', isUploadSlot: false },
    {
      id: 'inner-upload-1',
      label: '',
      isUploadSlot: true,
      placeholder: 'Upload Inner Carton Shipping Mark',
      isRequired: true,
    },
  ]);

  const [masterCartonItems, setMasterCartonItems] = useState<GridImageItem[]>([
    { id: 'master-1', label: '4 PCS', isUploadSlot: false },
    { id: 'master-2', label: '1 Master Carton', isUploadSlot: false },
    {
      id: 'master-upload-1',
      label: '',
      isUploadSlot: true,
      placeholder: 'Upload Master Carton Main Shipping Mark',
      isRequired: true,
    },
    {
      id: 'master-upload-2',
      label: '',
      isUploadSlot: true,
      placeholder: 'Upload Master Carton Side Shipping Mark',
      isRequired: true,
    },
  ]);

  const form = useForm<UploadAssortmentImageDTO>({
    resolver: zodResolver(uploadAssortmentImageSchema),
    defaultValues: {
      _id: assortment._id,
      itemPackImages: [],
      itemBarcodeImages: [],
      displayImages: [],
      innerCartonImages: [],
      masterCartonImages: [],
      imageLabels: {},
    },
  });

  // Custom dirty state since we're managing state outside of React Hook Form
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Helper function to mark form as dirty
  const markFormAsDirty = () => {
    setHasUnsavedChanges(true);
    // Force form to be dirty by updating a tracked field
    form.setValue(
      'imageLabels',
      { ...form.getValues('imageLabels'), timestamp: Date.now().toString() },
      { shouldDirty: true },
    );
    console.log('Form marked as dirty:', {
      hasUnsavedChanges: true,
      formIsDirty: form.formState.isDirty,
    });
  };

  // Watch for changes in grid items and mark form as dirty
  useEffect(() => {
    const hasFileChanges =
      itemPackSections.some((section) =>
        section.items.some((item) => item.file),
      ) ||
      itemBarcodeItems.some((item) => item.file) ||
      displayItems.some((item) => item.file) ||
      innerCartonItems.some((item) => item.file) ||
      masterCartonItems.some((item) => item.file);

    const hasLabelChanges =
      itemPackSections.some((section) =>
        section.items.some((item) => item.label && item.label.trim() !== ''),
      ) ||
      itemBarcodeItems.some((item) => item.label && item.label.trim() !== '') ||
      displayItems.some((item) => item.label && item.label.trim() !== '') ||
      innerCartonItems.some((item) => item.label && item.label.trim() !== '') ||
      masterCartonItems.some((item) => item.label && item.label.trim() !== '');

    // Always mark as dirty if there are any changes
    if (hasFileChanges || hasLabelChanges) {
      markFormAsDirty();
    }
  }, [
    itemPackSections,
    itemBarcodeItems,
    displayItems,
    innerCartonItems,
    masterCartonItems,
    form,
    assortment._id,
  ]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const { mutate, isPending } = useUploadAssortmentImage({
    onSuccess: (data) => {
      form.reset();
      setHasUnsavedChanges(false); // Reset our custom dirty state
      queryClient.setQueryData([QUERY_KEYS.ASSORTMENTS, assortment._id], data);
      toast.success('Changes saved successfully');
    },
  });

  function onSubmit(values: UploadAssortmentImageDTO) {
    // Collect files from each section
    const itemPackFiles = itemPackSections.flatMap((section) =>
      section.items.filter((item) => item.file).map((item) => item.file!),
    );

    const itemBarcodeFiles = itemBarcodeItems
      .filter((item) => item.file)
      .map((item) => item.file!);
    const displayFiles = displayItems
      .filter((item) => item.file)
      .map((item) => item.file!);
    const innerCartonFiles = innerCartonItems
      .filter((item) => item.file)
      .map((item) => item.file!);
    const masterCartonFiles = masterCartonItems
      .filter((item) => item.file)
      .map((item) => item.file!);

    // Collect labels
    const imageLabels: Record<string, string> = {};

    itemPackSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.label) {
          imageLabels[item.id] = item.label;
        }
      });
    });

    [
      ...itemBarcodeItems,
      ...displayItems,
      ...innerCartonItems,
      ...masterCartonItems,
    ].forEach((item) => {
      if (item.label) {
        imageLabels[item.id] = item.label;
      }
    });

    const updatedValues: UploadAssortmentImageDTO = {
      ...values,
      _id: assortment._id,
      itemPackImages: itemPackFiles,
      itemBarcodeImages: itemBarcodeFiles,
      displayImages: displayFiles,
      innerCartonImages: innerCartonFiles,
      masterCartonImages: masterCartonFiles,
      imageLabels,
    };

    mutate(updatedValues);
  }

  const addItemPackSection = () => {
    const newSectionNumber = itemPackSections.length + 1;
    const newSection: ItemPackSection = {
      id: `item-pack-${newSectionNumber}`,
      title: `ITEM ${newSectionNumber} PACK`,
      items: [
        {
          id: `item${newSectionNumber}-1`,
          label: `Design ${newSectionNumber} - Product`,
          isUploadSlot: false,
        },
        {
          id: `item${newSectionNumber}-2`,
          label: 'Packaging',
          isUploadSlot: false,
        },
        {
          id: `item${newSectionNumber}-3`,
          label: 'Final Image',
          isUploadSlot: false,
        },
      ],
    };
    setItemPackSections([...itemPackSections, newSection]);
  };

  const updateItemPackSection = (sectionId: string, items: GridImageItem[]) => {
    setItemPackSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, items } : section,
      ),
    );
    markFormAsDirty(); // Mark form as dirty when items change
  };

  const handleCrossSectionTransfer = (
    fromSectionId: string,
    toSectionId: string,
    item: GridImageItem,
    targetIndex: number,
  ) => {
    // Remove item from source section
    setItemPackSections((prev) => {
      const newSections = prev.map((section) => {
        if (section.id === fromSectionId) {
          return {
            ...section,
            items: section.items.filter((i) => i.id !== item.id),
          };
        }
        if (section.id === toSectionId) {
          const newItems = [...section.items];
          newItems.splice(targetIndex, 0, item);
          return {
            ...section,
            items: newItems,
          };
        }
        return section;
      });
      return newSections;
    });
    markFormAsDirty(); // Mark form as dirty when transferring items
  };

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
            disabled={
              isPending || (!form.formState.isDirty && !hasUnsavedChanges)
            }
            onClick={() => form.handleSubmit(onSubmit)()}
            className="flex items-center transition-transform duration-200 hover:scale-105"
          >
            {isPending && (
              <Icons.LoaderSpinner
                height={16}
                width={16}
                className="custom-spinner"
              />
            )}
            <span className="ml-2">{t(`keyButton_saveChanges`)}</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm px-4 py-1 mt-4">
        {/* ITEM PACK - Multiple sub-sections */}
        <AccordionItem
          eventKey="0"
          title={t('keyImageSection_itemPack')}
          isOpen={openSections['0']}
          onToggle={() => toggleSection('0')}
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-700">ITEM PACK SECTIONS</h4>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addItemPackSection}
                className="flex items-center transition-transform duration-200 hover:scale-105"
              >
                <div className="flex items-center">
                  <Icons.Plus height={16} width={16} />
                  <span className="ml-2">Add Item Pack Group</span>
                </div>
              </Button>
            </div>

            {itemPackSections.map((section) => (
              <div
                key={section.id}
                className="border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:shadow-md"
              >
                <h5 className="font-medium text-gray-600 mb-4">
                  {section.title}
                </h5>
                <GridImageSection
                  assortmentId={assortment._id}
                  items={section.items}
                  onItemsChange={(items) =>
                    updateItemPackSection(section.id, items)
                  }
                  sectionId={section.id}
                  onCrossSectionTransfer={handleCrossSectionTransfer}
                  acceptCrossSectionTransfers={true}
                />
              </div>
            ))}
          </div>
        </AccordionItem>

        {/* ITEM BARCODE */}
        <AccordionItem
          eventKey="1"
          title={t('keyImageSection_itemBarcode')}
          isOpen={openSections['1']}
          onToggle={() => toggleSection('1')}
        >
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">BARCODE LABEL</h4>
          </div>
          <GridImageSection
            assortmentId={assortment._id}
            items={itemBarcodeItems}
            onItemsChange={(items) => {
              setItemBarcodeItems(items);
              markFormAsDirty();
            }}
          />
        </AccordionItem>

        {/* DISPLAY */}
        <AccordionItem
          eventKey="2"
          title={t('keyImageSection_display')}
          isOpen={openSections['2']}
          onToggle={() => toggleSection('2')}
        >
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">DISPLAY PACK</h4>
          </div>
          <GridImageSection
            assortmentId={assortment._id}
            items={displayItems}
            onItemsChange={(items) => {
              setDisplayItems(items);
              markFormAsDirty();
            }}
          />
        </AccordionItem>

        {/* INNER CARTON */}
        <AccordionItem
          eventKey="3"
          title={t('keyImageSection_innerCarton')}
          isOpen={openSections['3']}
          onToggle={() => toggleSection('3')}
        >
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">
              INNER CARTON PACK
            </h4>
          </div>
          <GridImageSection
            assortmentId={assortment._id}
            items={innerCartonItems}
            onItemsChange={(items) => {
              setInnerCartonItems(items);
              markFormAsDirty();
            }}
          />
        </AccordionItem>

        {/* MASTER CARTON */}
        <AccordionItem
          eventKey="4"
          title={t('keyImageSection_masterCarton')}
          isOpen={openSections['4']}
          onToggle={() => toggleSection('4')}
        >
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">
              MASTER CARTON PACK
            </h4>
          </div>
          <GridImageSection
            assortmentId={assortment._id}
            items={masterCartonItems}
            onItemsChange={(items) => {
              setMasterCartonItems(items);
              markFormAsDirty();
            }}
          />
        </AccordionItem>
      </div>
    </Form>
  );
}
