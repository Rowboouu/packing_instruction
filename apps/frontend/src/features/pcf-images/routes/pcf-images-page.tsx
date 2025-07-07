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
import { useTranslation } from 'react-i18next';
import { PcfImage } from '..';
import { GridImageSection } from '../components/grid-image-section';

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

export interface PCFImagesPageProps<T extends Assortment> {
  assortment: T & { 
    pcfImages?: OdooPcfImages;
  };
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

  // Type guard to check if assortment has pcfImages
  const assortmentWithImages = assortment as T & { pcfImages?: OdooPcfImages };

  // Helper function to convert Odoo image to GridImageItem
  const convertOdooImageToGridItem = (odooImage: OdooPcfImage, index: number): GridImageItem => {
    // Convert Odoo image to PcfImage format with all required properties
    const pcfImage: PcfImage = {
      _id: `odoo-${odooImage.id}`,
      id: odooImage.id,
      componentName: odooImage.componentName,
      filename: odooImage.filename,
      field: 'image', // Default field name
      image: odooImage.image, // Base64 data
      // Add any other required PcfImage properties with default values
      // Adjust these based on your actual PcfImage interface requirements
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      size: odooImage.image ? odooImage.image.length : 0,
      mimeType: 'image/jpeg', // Default, could be determined from filename
    } as unknown as PcfImage;

    return {
      id: `odoo-${odooImage.id}-${index}`,
      pcfImage,
      label: odooImage.componentName || `Component ${index + 1}`,
      isUploadSlot: false,
    };
  };

  // Initialize Item Pack sections dynamically from Odoo data
  const initializeItemPackSections = (): ItemPackSection[] => {
    const itemPackImages = assortmentWithImages.pcfImages?.itemPackImages || [];
    
    if (itemPackImages.length === 0) {
      // Create one default section if no data
      return [{
        id: 'item-pack-1',
        title: 'ITEM PACK 1',
        items: [{
          id: 'default-upload-1',
          label: 'Upload Image',
          isUploadSlot: true,
          placeholder: 'Upload product image',
        }],
      }];
    }

    return itemPackImages.map((packArray: OdooPcfImage[], index: number) => {
      const sectionNumber = index + 1;
      const items: GridImageItem[] = packArray.map((odooImage: OdooPcfImage, imgIndex: number) => 
        convertOdooImageToGridItem(odooImage, imgIndex)
      );

      // Add upload slot for additional images
      items.push({
        id: `upload-pack-${sectionNumber}-${items.length + 1}`,
        label: 'Add Image',
        isUploadSlot: true,
        placeholder: 'Upload additional image',
      });

      return {
        id: `item-pack-${sectionNumber}`,
        title: `ITEM PACK ${sectionNumber}`,
        items,
      };
    });
  };

  // Initialize other sections dynamically from Odoo data
  const initializeImageSection = (
    images: OdooPcfImage[] = [],
    sectionName: string,
    defaultPlaceholder: string
  ): GridImageItem[] => {
    const items: GridImageItem[] = images.map((odooImage, index) => 
      convertOdooImageToGridItem(odooImage, index)
    );

    // Always add at least one upload slot
    items.push({
      id: `upload-${sectionName}-${Date.now()}`,
      label: 'Add Image',
      isUploadSlot: true,
      placeholder: defaultPlaceholder,
    });

    return items;
  };

  // State for accordion sections (all open by default)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    '0': true,
    '1': true,
    '2': true,
    '3': true,
    '4': true,
  });

  // Initialize all sections with Odoo data
  const [itemPackSections, setItemPackSections] = useState<ItemPackSection[]>(
    () => initializeItemPackSections()
  );

  const [itemBarcodeItems, setItemBarcodeItems] = useState<GridImageItem[]>(
    () => initializeImageSection(
      assortmentWithImages.pcfImages?.itemBarcodeImages,
      'barcode',
      'Upload barcode image'
    )
  );

  const [displayItems, setDisplayItems] = useState<GridImageItem[]>(
    () => initializeImageSection(
      assortmentWithImages.pcfImages?.displayImages,
      'display',
      'Upload display image'
    )
  );

  const [innerCartonItems, setInnerCartonItems] = useState<GridImageItem[]>(
    () => {
      const items = initializeImageSection(
        assortmentWithImages.pcfImages?.innerCartonImages,
        'inner-carton',
        'Upload inner carton image'
      );
      
      // Add required shipping mark upload slot
      items.push({
        id: `inner-shipping-mark-${Date.now()}`,
        label: 'Shipping Mark',
        isUploadSlot: true,
        placeholder: 'Upload inner carton shipping mark',
        isRequired: true,
      });
      
      return items;
    }
  );

  const [masterCartonItems, setMasterCartonItems] = useState<GridImageItem[]>(
    () => {
      const items = initializeImageSection(
        assortmentWithImages.pcfImages?.masterCartonImages,
        'master-carton',
        'Upload master carton image'
      );
      
      // Add required shipping mark upload slots
      items.push(
        {
          id: `master-main-mark-${Date.now()}`,
          label: 'Main Shipping Mark',
          isUploadSlot: true,
          placeholder: 'Upload master carton main shipping mark',
          isRequired: true,
        },
        {
          id: `master-side-mark-${Date.now()}`,
          label: 'Side Shipping Mark',
          isUploadSlot: true,
          placeholder: 'Upload master carton side shipping mark',
          isRequired: true,
        }
      );
      
      return items;
    }
  );

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
    form.setValue(
      'imageLabels',
      { ...form.getValues('imageLabels'), timestamp: Date.now().toString() },
      { shouldDirty: true },
    );
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
      setHasUnsavedChanges(false);
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
      title: `ITEM PACK ${newSectionNumber}`,
      items: [
        {
          id: `upload-pack-${newSectionNumber}-1`,
          label: 'Upload Image',
          isUploadSlot: true,
          placeholder: 'Upload product image',
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
    markFormAsDirty();
  };

  const handleCrossSectionTransfer = (
    fromSectionId: string,
    toSectionId: string,
    item: GridImageItem,
    targetIndex: number,
  ) => {
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
    markFormAsDirty();
  };

  // Helper function to get section count for display
  const getTotalImageCount = () => {
    const itemPackCount = itemPackSections.reduce(
      (acc, section) => acc + section.items.filter(item => item.pcfImage || item.file).length, 0
    );
    const barcodeCount = itemBarcodeItems.filter(item => item.pcfImage || item.file).length;
    const displayCount = displayItems.filter(item => item.pcfImage || item.file).length;
    const innerCount = innerCartonItems.filter(item => item.pcfImage || item.file).length;
    const masterCount = masterCartonItems.filter(item => item.pcfImage || item.file).length;
    
    return itemPackCount + barcodeCount + displayCount + innerCount + masterCount;
  };

  return (
    <Form {...form}>
      <div className="grid grid-cols-3 gap-4 items-left mb-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-600">
            Total Images: {getTotalImageCount()}
          </span>
        </div>
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
        {/* ITEM PACK - Dynamic sections based on Odoo data */}
        <AccordionItem
          eventKey="0"
          title={`${t('keyImageSection_itemPack')} (${itemPackSections.length} ${itemPackSections.length === 1 ? 'Section' : 'Sections'})`}
          isOpen={openSections['0']}
          onToggle={() => toggleSection('0')}
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-700">
                ITEM PACK SECTIONS
              </h4>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addItemPackSection}
                className="flex items-center transition-transform duration-200 hover:scale-105"
              >
                <div className="flex items-center">
                  <Icons.Plus height={16} width={16} />
                  <span className="ml-2">Add Pack Group</span>
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
          title={`${t('keyImageSection_itemBarcode')} (${itemBarcodeItems.filter(item => item.pcfImage || item.file).length} Images)`}
          isOpen={openSections['1']}
          onToggle={() => toggleSection('1')}
        >
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">BARCODE IMAGES</h4>
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
          title={`${t('keyImageSection_display')} (${displayItems.filter(item => item.pcfImage || item.file).length} Images)`}
          isOpen={openSections['2']}
          onToggle={() => toggleSection('2')}
        >
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">DISPLAY IMAGES</h4>
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
          title={`${t('keyImageSection_innerCarton')} (${innerCartonItems.filter(item => item.pcfImage || item.file).length} Images)`}
          isOpen={openSections['3']}
          onToggle={() => toggleSection('3')}
        >
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">
              INNER CARTON IMAGES
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
          title={`${t('keyImageSection_masterCarton')} (${masterCartonItems.filter(item => item.pcfImage || item.file).length} Images)`}
          isOpen={openSections['4']}
          onToggle={() => toggleSection('4')}
        >
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">
              MASTER CARTON IMAGES
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