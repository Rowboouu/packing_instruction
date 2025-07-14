import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { QUERY_KEYS } from '@/constant/query-key';
import {
  uploadImagesSchema as uploadAssortmentImageSchema,
  useUploadImagesSmart as useUploadAssortmentImage,
  useBatchDeleteImages,
  type UploadImagesFormDTO as UploadAssortmentImageDTO,
  type AssortmentData,
  useGetWebhookAssortment,
} from '@/features/packing-instructions';
import { useTranslation } from 'react-i18next';
import { PcfImage } from '..';
import { GridImageSection } from '../components/grid-image-section';

export interface PCFImagesPageProps {
  assortment: AssortmentData;
}

interface GridImageItem {
  id: string;
  file?: File;
  pcfImage?: PcfImage;
  label: string;
  isUploadSlot?: boolean;
  isRequired?: boolean;
  placeholder?: string;
  base64Data?: string;
  isMarkedForDeletion?: boolean;
  replacementFile?: File;
  shippingMarkType?: 'inner' | 'main' | 'side'; // ✅ NEW: Track shipping mark type
  category?: string; // ✅ NEW: Track which category this slot belongs to
}

interface ItemPackSection {
  id: string;
  title: string;
  items: GridImageItem[];
}

interface AccordionItemProps {
  eventKey: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

interface ReplacementData {
  file: File;
  category?: string;
  shippingMarkType?: 'inner' | 'main' | 'side'; // ✅ FIXED: Updated type
}

function AccordionItem({ title, isOpen, onToggle, children }: AccordionItemProps) {
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

const isOdooImage = (item: GridImageItem): boolean => {
  // Method 1: Check if it has base64Data (Odoo images have base64Data, user uploads have file paths)
  if (item.base64Data && item.base64Data.startsWith('data:') || (item.base64Data && !item.base64Data.startsWith('/'))) {
    return true;
  }
  
  // Method 2: Check the ID prefix (Odoo images have "odoo-" prefix)
  if (item.id.startsWith('odoo-')) {
    return true;
  }
  
  // Method 3: Check pcfImage ID structure
  if (item.pcfImage?._id?.startsWith('odoo-')) {
    return true;
  }
  
  // Method 4: Check if base64Data doesn't start with '/webhook/' (user uploads have this path)
  if (item.base64Data && !item.base64Data.startsWith('/webhook/')) {
    return true;
  }
  
  return false;
};

// ✅ EXPORT this function so other components can use it:
export { isOdooImage };

export function PCFImagesPage({ assortment }: PCFImagesPageProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // FIXED: Updated staging states with proper typing
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  const [pendingReplacements, setPendingReplacements] = useState<Map<string, ReplacementData>>(new Map());
  
  // Section states
  const [itemPackSections, setItemPackSections] = useState<ItemPackSection[]>([]);
  const [itemBarcodeItems, setItemBarcodeItems] = useState<GridImageItem[]>([]);
  const [displayItems, setDisplayItems] = useState<GridImageItem[]>([]);
  const [innerCartonItems, setInnerCartonItems] = useState<GridImageItem[]>([]);
  const [masterCartonItems, setMasterCartonItems] = useState<GridImageItem[]>([]);
  
  // UI states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    '0': true, '1': true, '2': true, '3': true, '4': true,
  });

  const assortmentItemNo = assortment?.baseAssortment?.itemNo || (assortment as any)?.itemNo || '';
  const { data: freshMongoData } = useGetWebhookAssortment(
    assortmentItemNo,
    { enabled: !!assortmentItemNo, staleTime: 0, gcTime: 0, refetchOnMount: true, refetchOnWindowFocus: false }
  );
  const actualAssortment = freshMongoData || assortment;
  const assortmentId = actualAssortment?.baseAssortment?.itemNo || (actualAssortment as any)?.itemNo || '';

  // FIXED: Calculate if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    // Check for new files (files added to upload slots that now have actual File objects)
    const hasNewFiles = [
      ...itemPackSections.flatMap(s => s.items),
      ...itemBarcodeItems,
      ...displayItems,
      ...innerCartonItems,
      ...masterCartonItems
    ].some(item => item.file && item.isUploadSlot); // FIXED: Changed to check isUploadSlot
    
    return pendingDeletions.length > 0 || pendingReplacements.size > 0 || hasNewFiles;
  }, [pendingDeletions, pendingReplacements, itemPackSections, itemBarcodeItems, displayItems, innerCartonItems, masterCartonItems]);

  // Enhanced staging handlers
  const handleStageForDeletion = useCallback((imageFilename: string) => {
    if (!pendingDeletions.includes(imageFilename)) {
      setPendingDeletions(prev => [...prev, imageFilename]);
      toast.info(`Image marked for deletion. Click 'Save Changes' to confirm.`);
    }
  }, [pendingDeletions]);

  // ✅ ENHANCED: Updated replacement staging with shipping mark type tracking
  const handleStageForReplacement = useCallback((imageFilename: string, newFile: File, category?: string) => {
    // If no category provided, we need to detect it from the current image location
    let detectedCategory = category;
    let shippingMarkType: 'inner' | 'main' | 'side' | undefined;
    
    if (!detectedCategory) {
      // Search through all sections to find which category this image belongs to
      const allSections = [
        { items: displayItems, category: 'displayImages' },
        { items: innerCartonItems, category: 'innerCartonImages' },
        { items: masterCartonItems, category: 'masterCartonImages' },
        { items: itemBarcodeItems, category: 'itemBarcodeImages' },
        // For itemPack, we need to check which section index it belongs to
        ...itemPackSections.map((section, index) => ({
          items: section.items,
          category: 'itemPackImages',
          sectionIndex: index
        }))
      ];

      for (const section of allSections) {
        const foundImage = section.items.find(item => 
          item.pcfImage?.filename === imageFilename || 
          item.pcfImage?.fileData?.filename === imageFilename ||
          item.pcfImage?.fileData?.originalname === imageFilename
        );
        
        if (foundImage) {
          detectedCategory = section.category;
          shippingMarkType = foundImage.shippingMarkType; // ✅ NEW: Capture shipping mark type
          console.log(`🔍 Detected category for ${imageFilename}: ${detectedCategory}`, shippingMarkType ? `with shipping mark type: ${shippingMarkType}` : '');
          break;
        }
      }
    }

    setPendingReplacements(prev => {
      const newMap = new Map(prev);
      newMap.set(imageFilename, { 
        file: newFile, 
        category: detectedCategory || 'displayImages', // Fallback to displayImages only if detection fails
        shippingMarkType // ✅ NEW: Include shipping mark type
      });
      return newMap;
    });

    const updateItemsWithReplacement = (items: GridImageItem[]) => {
      return items.map(item => {
        if (item.pcfImage?.filename === imageFilename || 
            item.pcfImage?.fileData?.filename === imageFilename ||
            item.pcfImage?.fileData?.originalname === imageFilename) {
          return { ...item, replacementFile: newFile };
        }
        return item;
      });
    };

    // Update all relevant sections
    setDisplayItems(updateItemsWithReplacement);
    setInnerCartonItems(updateItemsWithReplacement);
    setMasterCartonItems(updateItemsWithReplacement);
    setItemBarcodeItems(updateItemsWithReplacement);
    
    // Update item pack sections
    setItemPackSections(prevSections => 
      prevSections.map(section => ({
        ...section,
        items: updateItemsWithReplacement(section.items)
      }))
    );
    
    const markInfo = shippingMarkType ? ` (${shippingMarkType} shipping mark)` : '';
    toast.info(`Image replacement staged for ${detectedCategory || 'unknown category'}${markInfo}. Click 'Save Changes' to confirm.`);
  }, [displayItems, innerCartonItems, masterCartonItems, itemBarcodeItems, itemPackSections]);

  // Simplified Odoo image conversion (no base64 processing)
  const convertOdooImageToGridItem = useCallback((odooImage: any, index: number): GridImageItem => {
    const pcfImage: PcfImage = {
      _id: `odoo-${odooImage.id}`,
      id: odooImage.id.toString(),
      componentName: odooImage.componentName,
      filename: odooImage.filename,
      field: 'image',
      isApproved: true,
      sequence: 0 as const,
      fileData: {
        _id: `odoo-file-${odooImage.id}`,
        originalname: odooImage.filename,
        encoding: 'base64',
        mimetype: 'image/png', // Default
        filename: odooImage.filename,
        size: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      id: `odoo-${odooImage.id}-${index}`,
      pcfImage,
      label: odooImage.componentName || `Component ${index + 1}`,
      isUploadSlot: false,
      base64Data: odooImage.image, // Pass raw image data
      isMarkedForDeletion: pendingDeletions.includes(odooImage.filename),
    };
  }, [pendingDeletions]);

  // ✅ ENHANCED: User uploaded file conversion with shipping mark type detection
  const convertUploadedFileToGridItem = useCallback((uploadedFile: any, index: number, prefix: string, shippingMarkType?: 'inner' | 'main' | 'side'): GridImageItem => {
    const filename = uploadedFile.filename || uploadedFile.originalname;
    
    const pcfImage: PcfImage = {
      _id: `${prefix}-${filename || index}`,
      id: `user-${index}`,
      componentName: uploadedFile.originalname || `User Upload ${index + 1}`,
      filename: filename,
      field: 'user-upload',
      isApproved: true,
      sequence: 0 as const,
      fileData: {
        _id: `user-file-${index}`,
        originalname: uploadedFile.originalname,
        encoding: 'base64',
        mimetype: uploadedFile.mimetype,
        filename: filename,
        size: uploadedFile.size,
        createdAt: uploadedFile.uploadedAt || new Date().toISOString(),
        updatedAt: uploadedFile.uploadedAt || new Date().toISOString(),
      },
      createdAt: uploadedFile.uploadedAt || new Date().toISOString(),
      updatedAt: uploadedFile.uploadedAt || new Date().toISOString(),
    };

    const isMarkedForDeletion = pendingDeletions.includes(filename);
    const replacementData = pendingReplacements.get(filename);

    return {
      id: `${prefix}-${index}`,
      pcfImage,
      label: uploadedFile.originalname || `User Upload ${index + 1}`,
      isUploadSlot: false,
      base64Data: `/webhook/pcf-images/${filename}`,
      isMarkedForDeletion,
      replacementFile: replacementData?.file,
      shippingMarkType, // ✅ NEW: Include shipping mark type
    };
  }, [pendingDeletions, pendingReplacements]);

  // ✅ ENHANCED: Helper function to detect shipping mark type from filename
  const detectShippingMarkType = useCallback((filename: string): 'inner' | 'main' | 'side' | undefined => {
    const lowerFilename = filename.toLowerCase();
    if (lowerFilename.includes('inner') && lowerFilename.includes('shipping')) {
      return 'inner';
    }
    if (lowerFilename.includes('main') && lowerFilename.includes('shipping')) {
      return 'main';
    }
    if (lowerFilename.includes('side') && lowerFilename.includes('shipping')) {
      return 'side';
    }
    return undefined;
  }, []);

  // Helper functions for section initialization
  const initializeItemPackSectionsWithData = useCallback((webhookImages: any, userMods: any): ItemPackSection[] => {
    const itemPackImages = webhookImages?.itemPackImages || [];
    const userUploadedItemPack = (userMods?.uploadedImages as any)?.itemPackImages || [];
    
    if (itemPackImages.length === 0 && userUploadedItemPack.length === 0) {
      return [{
        id: 'item-pack-1',
        title: 'ITEM PACK 1',
        items: [{
          id: 'default-upload-1',
          label: 'Upload Image',
          isUploadSlot: true,
          placeholder: 'Upload product image',
          category: 'itemPackImages', // ✅ NEW: Set category
        }],
      }];
    }

    const sections: ItemPackSection[] = [];

    // Add Odoo webhook images
    if (Array.isArray(itemPackImages)) {
      itemPackImages.forEach((packArray: any, index: number) => {
        if (Array.isArray(packArray)) {
          const sectionNumber = index + 1;
          const items: GridImageItem[] = packArray
            .map((img: any, i: number) => convertOdooImageToGridItem(img, i))
            .filter(item => !item.isMarkedForDeletion);
          
          sections.push({
            id: `item-pack-${sectionNumber}`,
            title: `ITEM PACK ${sectionNumber}`,
            items,
          });
        }
      });
    }

    // Add user uploaded images
    if (Array.isArray(userUploadedItemPack) && userUploadedItemPack.length > 0) {
      const userItems: GridImageItem[] = userUploadedItemPack
        .map((file: any, i: number) => convertUploadedFileToGridItem(file, i, 'user-itempack'))
        .filter(item => !item.isMarkedForDeletion);

      if (sections.length > 0) {
        sections[0].items.push(...userItems);
      } else {
        sections.push({
          id: 'item-pack-user',
          title: 'ITEM PACK 1 (User Uploads)',
          items: userItems,
        });
      }
    }

    // Add upload slots
    sections.forEach(section => {
      section.items.push({
        id: `upload-pack-${section.id}-${Date.now()}`,
        label: 'Add Image',
        isUploadSlot: true,
        placeholder: 'Upload additional image',
        category: 'itemPackImages', // ✅ NEW: Set category
      });
    });

    return sections;
  }, [convertOdooImageToGridItem, convertUploadedFileToGridItem]);

  // ✅ ENHANCED: Image section initialization with shipping mark field support
  const initializeImageSection = useCallback((
    images: any[] = [],
    userUploads: any[] = [],
    shippingMarks: any[] = [], // ✅ NEW: Separate shipping marks array
    sectionName: string,
    defaultPlaceholder: string,
    alwaysShowUploadSlot: boolean = false,
    category: string
  ): GridImageItem[] => {
    const items: GridImageItem[] = [];

    // Add Odoo webhook images
    if (Array.isArray(images)) {
      items.push(...images
        .map((img, i) => convertOdooImageToGridItem(img, i))
        .filter(item => !item.isMarkedForDeletion)
      );
    }

    // ✅ ENHANCED: Add user uploaded images with shipping mark type detection
    if (Array.isArray(userUploads)) {
      items.push(...userUploads
        .map((file, i) => {
          const shippingMarkType = detectShippingMarkType(file.filename || file.originalname || '');
          return convertUploadedFileToGridItem(file, i, `user-${sectionName}`, shippingMarkType);
        })
        .filter(item => !item.isMarkedForDeletion)
      );
    }

    // ✅ NEW: Add shipping marks as separate items with proper identification
    if (Array.isArray(shippingMarks)) {
      shippingMarks.forEach((file, i) => {
        // Shipping marks already have their type determined by the field they came from
        let shippingMarkType: 'inner' | 'main' | 'side' | undefined;
        if (sectionName.includes('inner')) shippingMarkType = 'inner';
        else if (sectionName.includes('main')) shippingMarkType = 'main';
        else if (sectionName.includes('side')) shippingMarkType = 'side';
        
        const shippingMarkItem = convertUploadedFileToGridItem(file, i, `shipping-${sectionName}`, shippingMarkType);
        
        console.log('🚚 Creating shipping mark item:', {
          filename: file.filename || file.originalname,
          sectionName,
          shippingMarkType,
          itemId: shippingMarkItem.id,
          isMarkedForDeletion: shippingMarkItem.isMarkedForDeletion
        });
        
        if (!shippingMarkItem.isMarkedForDeletion) {
          items.push(shippingMarkItem);
        }
      });
    }

    const hasExistingImages = items.length > 0;
  
    if (!hasExistingImages || alwaysShowUploadSlot) {
      items.push({
        id: `upload-${sectionName}-${Date.now()}`,
        label: 'Add Image',
        isUploadSlot: true,
        placeholder: defaultPlaceholder,
        category, // ✅ NEW: Set category
      });
    }

    return items;
  }, [convertOdooImageToGridItem, convertUploadedFileToGridItem, detectShippingMarkType]);

  // Image copying logic - last image of each category becomes first of next
  const copyLastImages = useCallback((
    itemPackSections: ItemPackSection[],
    displayItems: GridImageItem[],
    innerCartonItems: GridImageItem[],
    masterCartonItems: GridImageItem[]
  ) => {
    const copiedImages: GridImageItem[] = [];

    // Get last images from each item pack section
    itemPackSections.forEach((section, sectionIndex) => {
      const actualImages = section.items.filter(item => !item.isUploadSlot && !item.isMarkedForDeletion);
      if (actualImages.length > 0) {
        const lastImage = actualImages[actualImages.length - 1];
        const copiedImage = {
          ...lastImage,
          id: `copied-itempack-${sectionIndex}-${Date.now()}`,
          label: `${lastImage.label} (from Item Pack ${sectionIndex + 1})`,
        };
        copiedImages.push(copiedImage);
      }
    });

    // Copy last display image to inner carton
    const actualDisplayImages = displayItems.filter(item => !item.isUploadSlot && !item.isMarkedForDeletion);
    if (actualDisplayImages.length > 0) {
      const lastDisplay = actualDisplayImages[actualDisplayImages.length - 1];
      const copiedDisplay = {
        ...lastDisplay,
        id: `copied-display-${Date.now()}`,
        label: `${lastDisplay.label} (from Display)`,
      };
      
      // Add to inner carton at the beginning
      const newInnerCartonItems = [copiedDisplay, ...innerCartonItems];
      
      // Copy last inner carton to master carton
      const actualInnerImages = newInnerCartonItems.filter(item => !item.isUploadSlot && !item.isMarkedForDeletion);
      if (actualInnerImages.length > 0) {
        const lastInner = actualInnerImages[actualInnerImages.length - 1];
        const copiedInner = {
          ...lastInner,
          id: `copied-inner-${Date.now()}`,
          label: `${lastInner.label} (from Inner Carton)`,
        };
        
        const newMasterCartonItems = [copiedInner, ...masterCartonItems];
        return { 
          newDisplayItems: [...copiedImages, ...displayItems],
          newInnerCartonItems,
          newMasterCartonItems
        };
      }
      
      return { 
        newDisplayItems: [...copiedImages, ...displayItems],
        newInnerCartonItems,
        newMasterCartonItems: masterCartonItems
      };
    }

    return {
      newDisplayItems: [...copiedImages, ...displayItems],
      newInnerCartonItems: innerCartonItems,
      newMasterCartonItems: masterCartonItems
    };
  }, []);

  // ✅ ENHANCED: Initialize sections with shipping mark data integration
  const initializeAllSections = useCallback((webhookImages: any, userMods: any) => {
    // First, initialize base sections without copying
    const baseItemPackSections = initializeItemPackSectionsWithData(webhookImages, userMods);

    // ✅ ENHANCED: Extract shipping mark data from userMods
    const userUploadedImages = userMods?.uploadedImages || {};
    
    console.log('🔍 Debug userMods structure:', {
      hasUserMods: !!userMods,
      hasUploadedImages: !!userUploadedImages,
      innerCartonShippingMarks: userUploadedImages?.innerCartonShippingMarks?.length || 0,
      masterCartonMainShippingMarks: userUploadedImages?.masterCartonMainShippingMarks?.length || 0,
      masterCartonSideShippingMarks: userUploadedImages?.masterCartonSideShippingMarks?.length || 0,
      allFields: Object.keys(userUploadedImages || {})
    });
    
    const baseDisplayItems = initializeImageSection(
      webhookImages?.displayImages, 
      userUploadedImages?.displayImages || [], 
      [], // No shipping marks for display
      'display', 
      'Upload display image',
      false,
      'displayImages'
    );
    
    // ✅ ENHANCED: Initialize inner carton with regular images + shipping marks
    const baseInnerCartonItems = initializeImageSection(
      webhookImages?.innerCartonImages, 
      userUploadedImages?.innerCartonImages || [], 
      Array.isArray((userUploadedImages as any)?.innerCartonShippingMarks) ? (userUploadedImages as any).innerCartonShippingMarks : [], // ✅ NEW: Include shipping marks
      'inner-carton', 
      'Upload inner carton image',
      false,
      'innerCartonImages'
    );
    
    // ✅ ENHANCED: Initialize master carton with regular images + shipping marks
    const baseMasterCartonItems = initializeImageSection(
      webhookImages?.masterCartonImages, 
      userUploadedImages?.masterCartonImages || [], 
      [
        ...(Array.isArray((userUploadedImages as any)?.masterCartonMainShippingMarks) ? (userUploadedImages as any).masterCartonMainShippingMarks : []),
        ...(Array.isArray((userUploadedImages as any)?.masterCartonSideShippingMarks) ? (userUploadedImages as any).masterCartonSideShippingMarks : [])
      ], // ✅ NEW: Include both main and side shipping marks
      'master-carton', 
      'Upload master carton image',
      false,
      'masterCartonImages'
    );

    // Apply image copying logic
    const { newDisplayItems, newInnerCartonItems, newMasterCartonItems } = copyLastImages(
      baseItemPackSections,
      baseDisplayItems,
      baseInnerCartonItems,
      baseMasterCartonItems
    );

    // ✅ ENHANCED: Only add shipping mark upload slots if not already present
    const hasInnerShippingMark = newInnerCartonItems.some(item => 
      item.shippingMarkType === 'inner' && !item.isUploadSlot
    );
    const hasMainShippingMark = newMasterCartonItems.some(item => 
      item.shippingMarkType === 'main' && !item.isUploadSlot
    );
    const hasSideShippingMark = newMasterCartonItems.some(item => 
      item.shippingMarkType === 'side' && !item.isUploadSlot
    );

    console.log('🔍 Debug shipping mark presence:', {
      hasInnerShippingMark,
      hasMainShippingMark,
      hasSideShippingMark,
      innerCartonItemsCount: newInnerCartonItems.length,
      masterCartonItemsCount: newMasterCartonItems.length
    });

    if (!hasInnerShippingMark) {
      newInnerCartonItems.push({
        id: `inner-shipping-mark-${Date.now()}`,
        label: 'Shipping Mark',
        isUploadSlot: true,
        placeholder: 'Upload inner carton shipping mark',
        isRequired: true,
        category: 'innerCartonImages',
        shippingMarkType: 'inner',
      });
      console.log('➕ Added inner shipping mark upload slot');
    }
   
    if (!hasMainShippingMark) {
      newMasterCartonItems.push({
        id: `master-main-mark-${Date.now()}`,
        label: 'Main Shipping Mark',
        isUploadSlot: true,
        placeholder: 'Upload master carton main shipping mark',
        isRequired: true,
        category: 'masterCartonImages',
        shippingMarkType: 'main',
      });
      console.log('➕ Added main shipping mark upload slot');
    }
    
    if (!hasSideShippingMark) {
      newMasterCartonItems.push({
        id: `master-side-mark-${Date.now()}`,
        label: 'Side Shipping Mark',
        isUploadSlot: true,
        placeholder: 'Upload master carton side shipping mark',
        isRequired: true,
        category: 'masterCartonImages',
        shippingMarkType: 'side',
      });
      console.log('➕ Added side shipping mark upload slot');
    }

    return {
      itemPackSections: baseItemPackSections,
      displayItems: newDisplayItems,
      innerCartonItems: newInnerCartonItems,
      masterCartonItems: newMasterCartonItems,
    };
  }, [copyLastImages, initializeItemPackSectionsWithData, initializeImageSection]);

  // Initialize sections when data changes
  useEffect(() => {
    if (actualAssortment && assortmentId) {
      const currentWebhookImages = actualAssortment?.baseAssortment?.webhookImages || (actualAssortment as any)?.pcfImages;
      const currentUserMods = freshMongoData?.userModifications || actualAssortment?.userModifications || null;

      // ✅ NEW: Debug the raw API response
      console.log('🔍 DEBUG: Raw API response structure:', {
        actualAssortment: actualAssortment,
        freshMongoData: freshMongoData,
        userModsFromFresh: freshMongoData?.userModifications,
        userModsFromActual: actualAssortment?.userModifications,
        userModsChosen: currentUserMods,
        uploadedImagesFromAPI: currentUserMods?.uploadedImages,
        directShippingMarkAccess: currentUserMods?.uploadedImages?.innerCartonShippingMarks
      });

      console.log('🔍 DEBUG: Initializing sections with data:', {
        assortmentId,
        hasWebhookImages: !!currentWebhookImages,
        hasUserMods: !!currentUserMods,
        userModsKeys: currentUserMods ? Object.keys(currentUserMods) : [],
        uploadedImagesKeys: currentUserMods?.uploadedImages ? Object.keys(currentUserMods.uploadedImages) : [],
        uploadedImagesRaw: currentUserMods?.uploadedImages, // ✅ NEW: See the raw object
        innerCartonShippingMarksRaw: (currentUserMods?.uploadedImages as any)?.innerCartonShippingMarks, // ✅ NEW: Direct access
        innerCartonShippingMarks: Array.isArray((currentUserMods?.uploadedImages as any)?.innerCartonShippingMarks) ? (currentUserMods.uploadedImages as any).innerCartonShippingMarks.length : 0,
        masterCartonMainShippingMarks: Array.isArray((currentUserMods?.uploadedImages as any)?.masterCartonMainShippingMarks) ? (currentUserMods.uploadedImages as any).masterCartonMainShippingMarks.length : 0,
        masterCartonSideShippingMarks: Array.isArray((currentUserMods?.uploadedImages as any)?.masterCartonSideShippingMarks) ? (currentUserMods.uploadedImages as any).masterCartonSideShippingMarks.length : 0,
      });

      const { itemPackSections, displayItems, innerCartonItems, masterCartonItems } = initializeAllSections(
        currentWebhookImages,
        currentUserMods
      );

      console.log('🔍 DEBUG: Section initialization results:', {
        innerCartonItemsCount: innerCartonItems.length,
        masterCartonItemsCount: masterCartonItems.length,
        innerCartonItems: innerCartonItems.map(item => ({
          id: item.id,
          label: item.label,
          isUploadSlot: item.isUploadSlot,
          shippingMarkType: item.shippingMarkType,
          hasPcfImage: !!item.pcfImage,
          hasFile: !!item.file,
          base64Data: item.base64Data?.substring(0, 50) + '...' // Truncate for readability
        })),
        masterCartonItems: masterCartonItems.map(item => ({
          id: item.id,
          label: item.label,
          isUploadSlot: item.isUploadSlot,
          shippingMarkType: item.shippingMarkType,
          hasPcfImage: !!item.pcfImage,
          hasFile: !!item.file,
          base64Data: item.base64Data?.substring(0, 50) + '...'
        }))
      });

      setItemPackSections(itemPackSections);
      setDisplayItems(displayItems);
      setInnerCartonItems(innerCartonItems);
      setMasterCartonItems(masterCartonItems);

      // ✅ UPDATED: Initialize barcode items with conditional upload slot
      const barcodeItems = initializeImageSection(
        currentWebhookImages?.itemBarcodeImages,
        (currentUserMods?.uploadedImages as any)?.itemBarcodeImages || [],
        [], // No shipping marks for barcodes
        'barcode',
        'Upload barcode image',
        false, // Don't force upload slot if images exist
        'itemBarcodeImages'
      );
      setItemBarcodeItems(barcodeItems);
    }
  }, [actualAssortment, assortmentId, freshMongoData, pendingDeletions, pendingReplacements, initializeAllSections, initializeImageSection]);

  // Section management
  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const addItemPackSection = () => {
    const newSectionNumber = itemPackSections.length + 1;
    const newSection: ItemPackSection = {
      id: `item-pack-${newSectionNumber}`,
      title: `ITEM PACK ${newSectionNumber}`,
      items: [{
        id: `upload-pack-${newSectionNumber}-1`,
        label: 'Upload Image',
        isUploadSlot: true,
        placeholder: 'Upload product image',
        category: 'itemPackImages', // ✅ NEW: Set category
      }],
    };
    setItemPackSections([...itemPackSections, newSection]);
  };

  const updateItemPackSection = (sectionId: string, items: GridImageItem[]) => {
    setItemPackSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, items } : section
      )
    );
  };

  // Form setup
  const form = useForm<UploadAssortmentImageDTO>({
    resolver: zodResolver(uploadAssortmentImageSchema),
    defaultValues: {
      _id: assortmentId,
      isWebhookData: true,
      itemPackImages: [],
      itemBarcodeImages: [],
      displayImages: [],
      innerCartonImages: [],
      masterCartonImages: [],
      imageLabels: {},
    },
  });

  // Mutations
  const uploadMutation = useUploadAssortmentImage();
  const deleteMutation = useBatchDeleteImages();
  const isSaving = uploadMutation.isPending || deleteMutation.isPending;

  // ✅ ENHANCED: Sequential save changes logic with proper shipping mark separation
  const handleSaveChanges = async () => {
    const startTime = Date.now();
    
    try {
      // OPTIMIZATION: Run operations in parallel where possible
      const operations: Promise<any>[] = [];

      // Step 1: Handle deletions (can run in parallel with replacements if no conflicts)
      if (pendingDeletions.length > 0) {
        console.log(`🗑️ Deleting ${pendingDeletions.length} images`);
        operations.push(
          deleteMutation.mutateAsync({ assortmentId, imageIds: pendingDeletions })
        );
      }

      // Step 2: Handle replacements (delete + upload)
      if (pendingReplacements.size > 0) {
        console.log(`🔄 Processing ${pendingReplacements.size} replacements`);
        
        for (const [oldFilename, replacementData] of pendingReplacements) {
          // Delete old, then upload new (keep sequential for replacements)
          const replaceOperation = deleteMutation.mutateAsync({
            assortmentId, 
            imageIds: [oldFilename]
          }).then(() => {
            const category = replacementData.category || 'displayImages';
            
            // ✅ ENHANCED: Handle shipping mark replacements with proper categorization
            let uploadPayload: UploadAssortmentImageDTO;
            if (replacementData.shippingMarkType) {
              const shippingMarkLabel = `${replacementData.shippingMarkType}_shipping_mark`;
              uploadPayload = {
                _id: assortmentId,
                isWebhookData: true,
                [category]: [replacementData.file],
                imageLabels: {
                  [replacementData.file.name]: shippingMarkLabel
                },
              };
              console.log(`🚚 Uploading replacement shipping mark: ${shippingMarkLabel} to ${category}`);
            } else {
              uploadPayload = {
                _id: assortmentId,
                isWebhookData: true,
                [category]: [replacementData.file],
                imageLabels: {},
              };
            }
            
            return uploadMutation.mutateAsync(uploadPayload);
          });
          
          operations.push(replaceOperation);
        }
      }

      // ✅ ENHANCED: Step 3: Handle new uploads with proper shipping mark field separation
      const newFiles = {
        itemPackImages: [] as File[],
        itemBarcodeImages: [] as File[],
        displayImages: [] as File[],
        innerCartonImages: [] as File[], // ✅ Regular inner carton images only
        masterCartonImages: [] as File[], // ✅ Regular master carton images only
        // ✅ NEW: Dedicated shipping mark fields
        innerCartonShippingMarks: [] as File[],
        masterCartonMainShippingMarks: [] as File[],
        masterCartonSideShippingMarks: [] as File[],
      };

      const imageLabels: Record<string, string> = {};

      // ✅ ENHANCED: Collect files with proper shipping mark field separation
      const collectFilesFromSection = (items: GridImageItem[], category: string) => {
        items.filter(i => i.file && i.isUploadSlot).forEach(item => {
          if (item.file) {
            // ✅ CRITICAL: Route shipping marks to dedicated fields
            if (item.shippingMarkType) {
              const label = `${item.shippingMarkType}_shipping_mark`;
              imageLabels[item.file.name] = label;
              
              // ✅ NEW: Route to dedicated shipping mark fields
              if (item.shippingMarkType === 'inner') {
                newFiles.innerCartonShippingMarks.push(item.file);
                console.log(`🚚 Adding inner shipping mark: ${item.file.name}`);
              } else if (item.shippingMarkType === 'main') {
                newFiles.masterCartonMainShippingMarks.push(item.file);
                console.log(`🚚 Adding main shipping mark: ${item.file.name}`);
              } else if (item.shippingMarkType === 'side') {
                newFiles.masterCartonSideShippingMarks.push(item.file);
                console.log(`🚚 Adding side shipping mark: ${item.file.name}`);
              }
            } else {
              // ✅ Regular images go to their normal categories
              const regularCategory = category as keyof typeof newFiles;
              if (newFiles[regularCategory] && Array.isArray(newFiles[regularCategory])) {
                (newFiles[regularCategory] as File[]).push(item.file);
                console.log(`📤 Adding regular image: ${item.file.name} to ${category}`);
              }
            }
          }
        });
      };

      // Collect files from all sections
      itemPackSections.forEach(section => {
        collectFilesFromSection(section.items, 'itemPackImages');
      });
      collectFilesFromSection(itemBarcodeItems, 'itemBarcodeImages');
      collectFilesFromSection(displayItems, 'displayImages');
      collectFilesFromSection(innerCartonItems, 'innerCartonImages');
      collectFilesFromSection(masterCartonItems, 'masterCartonImages');

      const hasNewUploads = Object.values(newFiles).some(arr => arr.length > 0);
      if (hasNewUploads) {
        const totalFiles = Object.values(newFiles).flat().length;
        const shippingMarkCount = newFiles.innerCartonShippingMarks.length + 
                                  newFiles.masterCartonMainShippingMarks.length + 
                                  newFiles.masterCartonSideShippingMarks.length;
        
        console.log(`📤 Uploading ${totalFiles} files with ${shippingMarkCount} shipping marks to dedicated fields:`);
        console.log(`🚚 Shipping mark breakdown:`, {
          innerShippingMarks: newFiles.innerCartonShippingMarks.length,
          mainShippingMarks: newFiles.masterCartonMainShippingMarks.length,
          sideShippingMarks: newFiles.masterCartonSideShippingMarks.length,
        });
        console.log(`📦 Regular image breakdown:`, {
          itemPack: newFiles.itemPackImages.length,
          barcode: newFiles.itemBarcodeImages.length,
          display: newFiles.displayImages.length,
          innerCarton: newFiles.innerCartonImages.length,
          masterCarton: newFiles.masterCartonImages.length,
        });
        
        const uploadPayload: UploadAssortmentImageDTO = {
          _id: assortmentId,
          isWebhookData: true,
          ...newFiles, // ✅ Now includes dedicated shipping mark fields
          imageLabels, // ✅ Keep labels for backward compatibility
        };
        operations.push(uploadMutation.mutateAsync(uploadPayload));
      }

      // Execute all operations
      if (operations.length === 0) {
        toast.info('No changes to save.');
        return;
      }

      // OPTIMIZATION: Use Promise.allSettled for better error handling
      const results = await Promise.allSettled(operations);
      
      // Check results
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.error('Some operations failed:', failed);
        toast.error(`${failed.length} operations failed. Check console for details.`);
      } else {
        const duration = Date.now() - startTime;
        console.log(`✅ All operations completed in ${duration}ms`);
        toast.success(`All changes saved successfully! (${duration}ms)`);
      }

      // Clear staging and refresh
      setPendingDeletions([]);
      setPendingReplacements(new Map());

      const clearReplacementFiles = (items: GridImageItem[]) => {
        return items.map(item => ({ ...item, replacementFile: undefined }));
      };

      setDisplayItems(clearReplacementFiles);
      setInnerCartonItems(clearReplacementFiles);
      setMasterCartonItems(clearReplacementFiles);
      setItemBarcodeItems(clearReplacementFiles);
      setItemPackSections(prevSections => 
        prevSections.map(section => ({
          ...section,
          items: clearReplacementFiles(section.items)
        }))
      );

      form.reset();

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-assortment', assortmentId],
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Save operation failed after ${duration}ms:`, error);
      toast.error('Failed to save changes. Please try again.');
    }
  };

  if (!assortmentId) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <Form {...form}>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          {hasUnsavedChanges && (
            <span className="text-orange-600 font-medium">
              Unsaved changes: {pendingDeletions.length} deletions, {pendingReplacements.size} replacements
            </span>
          )}
        </div>
        <Button
          variant={'primary'}
          type="button"
          disabled={isSaving || !hasUnsavedChanges}
          onClick={handleSaveChanges}
          className="flex items-center"
        >
          <div className='flex items-center'>
            {isSaving && <Icons.LoaderSpinner height={16} width={16} className="custom-spinner" />}
            <span className="ml-2">{t('keyButton_saveChanges')}</span>
          </div>
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm px-4 py-1 mt-4">
        {/* Item Pack Sections */}
        <AccordionItem 
          eventKey="0" 
          title={`ITEM PACK (${itemPackSections.length} ${itemPackSections.length === 1 ? 'Section' : 'Sections'})`} 
          isOpen={openSections['0']} 
          onToggle={() => toggleSection('0')}
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-700">ITEM PACK SECTIONS</h4>
              <Button type="button" variant="secondary" size="sm" onClick={addItemPackSection}>
                <div className='flex items-center'>
                  <Icons.Plus height={16} width={16} />
                  <span className="ml-2">Add Pack Group</span>
                </div>     
              </Button>
            </div>
            {itemPackSections.map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4 overflow-auto">
                <h5 className="font-medium text-gray-600 mb-4">{section.title}</h5>
                <GridImageSection
                  assortmentId={assortmentId}
                  items={section.items}
                  onItemsChange={(items) => updateItemPackSection(section.id, items)}
                  onStageForDelete={handleStageForDeletion}
                  onStageForReplace={(filename, file) => handleStageForReplacement(filename, file, 'itemPackImages')}
                  sectionType="itemPackImages"
                  sectionId={section.id}
                  acceptCrossSectionTransfers={true}
                />
              </div>
            ))}
          </div>
        </AccordionItem>

        {/* Item Barcode */}
        <AccordionItem 
          eventKey="1" 
          title={`ITEM BARCODE (${itemBarcodeItems.filter(item => item.pcfImage || item.file).length} Images)`} 
          isOpen={openSections['1']} 
          onToggle={() => toggleSection('1')}
        >
          <GridImageSection
            assortmentId={assortmentId}
            items={itemBarcodeItems}
            onItemsChange={setItemBarcodeItems}
            onStageForDelete={handleStageForDeletion}
            onStageForReplace={(filename, file) => handleStageForReplacement(filename, file, 'itemBarcodeImages')}
            sectionType="itemBarcodeImages"
          />
        </AccordionItem>

        {/* Display */}
        <AccordionItem 
          eventKey="2" 
          title={`DISPLAY (${displayItems.filter(item => item.pcfImage || item.file).length} Images)`} 
          isOpen={openSections['2']} 
          onToggle={() => toggleSection('2')}
        >
          <GridImageSection
            assortmentId={assortmentId}
            items={displayItems}
            onItemsChange={setDisplayItems}
            onStageForDelete={handleStageForDeletion}
            onStageForReplace={(filename, file) => handleStageForReplacement(filename, file, 'displayImages')}
            sectionType="displayImages"
          />
        </AccordionItem>

        {/* Inner Carton */}
        <AccordionItem 
          eventKey="3" 
          title={`INNER CARTON (${innerCartonItems.filter(item => item.pcfImage || item.file).length} Images)`} 
          isOpen={openSections['3']} 
          onToggle={() => toggleSection('3')}
        >
          <GridImageSection
            assortmentId={assortmentId}
            items={innerCartonItems}
            onItemsChange={setInnerCartonItems}
            onStageForDelete={handleStageForDeletion}
            onStageForReplace={(filename, file) => handleStageForReplacement(filename, file, 'innerCartonImages')}
            sectionType="innerCartonImages"
          />
        </AccordionItem>

        {/* Master Carton */}
        <AccordionItem 
          eventKey="4" 
          title={`MASTER CARTON (${masterCartonItems.filter(item => item.pcfImage || item.file).length} Images)`} 
          isOpen={openSections['4']} 
          onToggle={() => toggleSection('4')}
        >
          <GridImageSection
            assortmentId={assortmentId}
            items={masterCartonItems}
            onItemsChange={setMasterCartonItems}
            onStageForDelete={handleStageForDeletion}
            onStageForReplace={(filename, file) => handleStageForReplacement(filename, file, 'masterCartonImages')}
            sectionType="masterCartonImages"
          />
        </AccordionItem>
      </div>
    </Form>
  );
}