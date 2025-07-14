import React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField } from '@/components/ui/form';
import { AssortmentData } from '@/features/packing-instructions';
import { useUpdateAssortment } from '@/features/packing-instructions';
import { PCFImageContent } from '..';

interface PreviewPDFContainerProps {
  assortment: AssortmentData;
}

export const PreviewPDFContainer = React.forwardRef<
  HTMLDivElement,
  PreviewPDFContainerProps
>((props, ref) => {
  const { assortment } = props;

  console.log('🔍 PreviewPDFContainer - Received AssortmentData:', assortment);

  // ✅ UPDATED: Extract data from AssortmentData structure
  const extractedData = React.useMemo(() => {
    // Check if we have the new transformed data structure passed as pcfImages
    const pcfImages = (assortment as any)?.pcfImages;
    
    if (pcfImages && typeof pcfImages === 'object' && !Array.isArray(pcfImages) && 
        ('finalProductImages' in pcfImages || 'barcodeImages' in pcfImages || 'shippingMarks' in pcfImages)) {
      console.log('🔍 Using new transformed data structure from props');
      
      return {
        finalProductImages: pcfImages.finalProductImages || [],
        howToPackSingleProduct: pcfImages.howToPackSingleProduct || [],
        barcodeImages: pcfImages.barcodeImages || [],
        displayImages: pcfImages.displayImages || [],
        innerCartonImages: pcfImages.innerCartonImages || [],
        masterCartonImages: pcfImages.masterCartonImages || [],
        innerCartonPackMark: pcfImages.innerCartonPackMark || null,
        mainShippingMark: pcfImages.mainShippingMark || null,
        sideShippingMark: pcfImages.sideShippingMark || null,
        innerCartonDimensions: pcfImages.innerCartonPacking?.dimensions || {
          length: assortment.baseAssortment?.inner_carton_length_cm || 0,
          width: assortment.baseAssortment?.inner_carton_width_cm || 0,
          height: assortment.baseAssortment?.inner_carton_height_cm || 0
        },
        masterCartonDimensions: pcfImages.masterCartonPack?.dimensions || {
          length: assortment.baseAssortment?.master_carton_length_cm || 0,
          width: assortment.baseAssortment?.master_carton_width_cm || 0,
          height: assortment.baseAssortment?.master_carton_height_cm || 0
        }
      };
    }

    // ✅ STANDARD: Extract from AssortmentData structure
    console.log('🔍 Using standard AssortmentData structure');
    
    const webhookImages = assortment.baseAssortment?.webhookImages;
    const userMods = assortment.userModifications;
    const mergedData = assortment.mergedData;

    if (!webhookImages && !userMods && !mergedData) {
      console.log('❌ No image data found in AssortmentData');
      return {
        finalProductImages: [],
        howToPackSingleProduct: [],
        barcodeImages: [],
        displayImages: [],
        innerCartonImages: [],
        masterCartonImages: [],
        innerCartonPackMark: null,
        mainShippingMark: null,
        sideShippingMark: null,
        innerCartonDimensions: {
          length: assortment.baseAssortment?.inner_carton_length_cm || 0,
          width: assortment.baseAssortment?.inner_carton_width_cm || 0,
          height: assortment.baseAssortment?.inner_carton_height_cm || 0
        },
        masterCartonDimensions: {
          length: assortment.baseAssortment?.master_carton_length_cm || 0,
          width: assortment.baseAssortment?.master_carton_width_cm || 0,
          height: assortment.baseAssortment?.master_carton_height_cm || 0
        }
      };
    }

    // Use mergedData if available, otherwise combine webhook + user data
    const allImages = mergedData?.allImages || {
      itemPackImages: [
        ...(webhookImages?.itemPackImages?.flat() || []),
        ...(userMods?.uploadedImages ? Object.values(userMods.uploadedImages).flatMap(comp => comp.itemPackImages) : [])
      ],
      itemBarcodeImages: [
        ...(webhookImages?.itemBarcodeImages || []),
        ...(userMods?.uploadedImages ? Object.values(userMods.uploadedImages).flatMap(comp => comp.itemBarcodeImages) : [])
      ],
      displayImages: [
        ...(webhookImages?.displayImages || []),
        ...(userMods?.uploadedImages ? Object.values(userMods.uploadedImages).flatMap(comp => comp.displayImages) : [])
      ],
      innerCartonImages: [
        ...(webhookImages?.innerCartonImages || []),
        ...(userMods?.uploadedImages ? Object.values(userMods.uploadedImages).flatMap(comp => comp.innerCartonImages) : [])
      ],
      masterCartonImages: [
        ...(webhookImages?.masterCartonImages || []),
        ...(userMods?.uploadedImages ? Object.values(userMods.uploadedImages).flatMap(comp => comp.masterCartonImages) : [])
      ]
    };

    // Create final product images (last from each itemPack array)
    const finalProductImages = webhookImages?.itemPackImages?.map((packArray: any[]) => 
      packArray[packArray.length - 1]
    ).filter(Boolean) || [];

    // Create how to pack sequences
    const howToPackSingleProduct = webhookImages?.itemPackImages?.map((packArray: any[], index: number) => ({
      rowIndex: index,
      images: packArray
    })) || [];

    // Find shipping marks from user uploads
    const findShippingMark = (type: 'inner' | 'main' | 'side') => {
      if (!userMods?.uploadedImages) return null;
      
      for (const comp of Object.values(userMods.uploadedImages)) {
        const images = type === 'inner' ? comp.innerCartonImages : comp.masterCartonImages;
        const found = images.find((img: any) => {
          const name = img.originalname?.toLowerCase() || img.filename?.toLowerCase() || '';
          if (type === 'inner') {
            return name.includes('shipping') || name.includes('mark');
          } else if (type === 'main') {
            return name.includes('main') && name.includes('shipping');
          } else {
            return name.includes('side') && name.includes('shipping');
          }
        });
        if (found) return found;
      }
      return null;
    };

    return {
      finalProductImages,
      howToPackSingleProduct,
      barcodeImages: allImages.itemBarcodeImages,
      displayImages: allImages.displayImages,
      innerCartonImages: allImages.innerCartonImages,
      masterCartonImages: allImages.masterCartonImages,
      innerCartonPackMark: findShippingMark('inner'),
      mainShippingMark: findShippingMark('main'),
      sideShippingMark: findShippingMark('side'),
      innerCartonDimensions: {
        length: assortment.baseAssortment?.inner_carton_length_cm || 0,
        width: assortment.baseAssortment?.inner_carton_width_cm || 0,
        height: assortment.baseAssortment?.inner_carton_height_cm || 0
      },
      masterCartonDimensions: {
        length: assortment.baseAssortment?.master_carton_length_cm || 0,
        width: assortment.baseAssortment?.master_carton_width_cm || 0,
        height: assortment.baseAssortment?.master_carton_height_cm || 0
      }
    };
  }, [assortment]);

  // ✅ ENHANCED: Calculate design statistics from itemPackImages
  const designStats = React.useMemo(() => {
    const webhookImages = assortment.baseAssortment?.webhookImages;
    const itemPackImages = webhookImages?.itemPackImages || [];
    
    if (!itemPackImages || itemPackImages.length === 0) {
      return {
        numberOfDesigns: 0,
        qtyPerDesign: 0,
        totalQtyInner: 0
      };
    }

    const numberOfDesigns = itemPackImages.length;
    
    // Find the largest array length minus 1 (since last image is the final product)
    const qtyPerDesign = Math.max(
      ...itemPackImages.map((packArray: any[]) => Math.max(0, packArray.length - 1))
    );
    
    const totalQtyInner = numberOfDesigns * qtyPerDesign;

    console.log('🔍 Design Stats:', {
      numberOfDesigns,
      qtyPerDesign,
      totalQtyInner,
      itemPackArrays: itemPackImages.map((arr: any[]) => arr.length)
    });

    return {
      numberOfDesigns,
      qtyPerDesign,
      totalQtyInner
    };
  }, [assortment]);

  const update = useUpdateAssortment();

  // ✅ SIMPLIFIED: Create a basic form interface without complex schemas
  interface SimpleFormData {
    _id: string;
    productInCarton?: number;
    productPerUnit?: number;
    unit?: string;
    masterCUFT?: number;
    cubicUnit?: string;
    masterGrossWeight?: number;
    wtUnit?: string;
  }

  const form = useForm<SimpleFormData>({
    defaultValues: {
      _id: '',
      productInCarton: 0,
      productPerUnit: 0,
      unit: 'PR',
      masterCUFT: 0,
      cubicUnit: 'cuft',
      masterGrossWeight: 0,
      wtUnit: 'lbs',
    }
  });

  const [isFocused, setFocused] = React.useState(false);

  const handleOnBlurUpdate = () => {
    setFocused(true);
  };

  const isDirty = form.formState.isDirty;

  React.useEffect(() => {
    if (isDirty && isFocused) {
      const values = form.getValues();
      // ✅ SIMPLIFIED: Create update payload without complex DTO
      const updatePayload = {
        _id: values._id,
        userModifications: {
          formData: {
            productInCarton: values.productInCarton,
            productPerUnit: values.productPerUnit,
            unit: values.unit,
            masterCUFT: values.masterCUFT,
            cubicUnit: values.cubicUnit,
            masterGrossWeight: values.masterGrossWeight,
            wtUnit: values.wtUnit
          }
        },
        isWebhookData: true
      };
      update.mutate(updatePayload as any);
    } else {
      setFocused(false);
    }
  }, [isDirty, isFocused, form, update]);

  const resetForm = React.useCallback(() => {
    // Extract form data from AssortmentData structure
    const baseAssortment = assortment.baseAssortment;
    const userMods = assortment.userModifications;
    const formData = userMods?.formData;

    // Get labels if they exist
    const labels = (baseAssortment as any)?.labels?.find((label: any) =>
      label.hasOwnProperty('unit'),
    );
    const unitVal = labels?.['unit'].value ?? 'PR';

    form.reset({
      _id: baseAssortment?._id || '',
      productInCarton: formData?.productInCarton || 0,
      productPerUnit: formData?.productPerUnit || 0,
      unit: formData?.unit ?? unitVal,
      masterCUFT: formData?.masterCUFT || 0,
      cubicUnit: formData?.cubicUnit ?? 'cuft',
      masterGrossWeight: formData?.masterGrossWeight || 0, 
      wtUnit: formData?.wtUnit ?? 'lbs',
    });
  }, [assortment, form]);

  React.useEffect(() => {
    resetForm();
    setFocused(false);
  }, [resetForm]);

  return (
    <Form {...form}>
      <div ref={ref} className="w-full max-w-[1240px] mx-auto bg-white">
        {/* Header Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-lg font-bold">PACKING INSTRUCTION</span>
        </div>

        {/* Basic Info Section */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-5 gap-4 items-center">
            <span className="font-bold">DESCRIPTIONS:</span>
            <input
              type="text"
              className="ml-2 border border-gray-300 px-3 py-2 rounded-md col-span-2"
              defaultValue={
                assortment.baseAssortment?.name || 'Beer Opener Keychain with Display'
              }
            />
          </div>
          <div className="grid grid-cols-5 gap-4 items-center">
            <span className="font-bold">ITEM NUMBER:</span>
            <input
              type="text"
              className="ml-2 border border-gray-300 px-3 py-2 col-span-2 rounded-md"
              defaultValue={assortment.baseAssortment?.itemNo || 'A000026'}
            />
          </div>
          <div className="grid grid-cols-5 gap-4 items-center">
            <span className="font-bold">CUSTOMER ITEM NUMBER:</span>
            <input
              type="text"
              className="ml-2 border border-gray-300 px-3 py-2 col-span-2 rounded-md"
              defaultValue={assortment.baseAssortment?.customerItemNo || 'FAR-0013'}
            />
          </div>
        </div>

        {/* ✅ UPDATED: Finish Product Images Section - Uses finalProductImages */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">FINISH PRODUCT IMAGES</span>
        </div>

        <div className="p-4 mb-6 min-h-64 flex items-center justify-center">
          {extractedData.finalProductImages.length > 0 ? (
            extractedData.finalProductImages.map((img: any, idx: number) => {
              if (!img) {
                console.warn('⚠️ Skipping undefined image in finalProductImages at index:', idx);
                return null;
              }
              return (
                <div
                  key={img._id || img.id || idx}
                  className="mx-2 flex items-center justify-center"
                >
                  <PCFImageContent pcfImage={img} height={240} maxWidth={400} />
                </div>
              );
            }).filter(Boolean)
          ) : (
            <div className="text-gray-500">No finish product images available</div>
          )}
        </div>

        {/* How to Pack Single Product Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">
            HOW TO PACK THE SINGLE PRODUCT?
          </span>
        </div>

        <div className="pb-2">
          <input
            type="text"
            className="w-full p-4 border border-gray-300 text-sm rounded-md"
            placeholder="Description here..."
          />
        </div>

        <div className="px-4 mb-6">
          <div className="flex items-center mb-2">
            <span className="font-bold mr-4">LABEL TYPE:</span>
            <select className="border border-gray-300 px-3 py-1 rounded-md">
              <option>Non - Removable</option>
            </select>
          </div>
        </div>

        {/* ✅ UPDATED: Product Assembly Visualization - Uses howToPackSingleProduct */}
        <div className="p-4 mb-6">
          {extractedData.howToPackSingleProduct.length > 0 ? (
            extractedData.howToPackSingleProduct.map((row: any, rowIdx: number) => (
              <div key={rowIdx} className="flex items-center justify-center space-x-8 mb-4">
                {row.images?.map((img: any, idx: number) => {
                  if (!img) {
                    console.warn('⚠️ Skipping undefined image in howToPackSingleProduct at row:', rowIdx, 'index:', idx);
                    return null;
                  }
                  return (
                    <React.Fragment key={img._id || img.id || idx}>
                      {idx > 0 && (
                        <div className="text-4xl font-bold">
                          {idx === row.images.length - 1 ? '=' : '+'}
                        </div>
                      )}
                      <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center">
                        <PCFImageContent pcfImage={img} height={180} maxWidth={180} />
                      </div>
                    </React.Fragment>
                  );
                }).filter(Boolean)}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No packing sequence images available</div>
          )}
        </div>

        {/* ✅ UPDATED: Barcode Section - Uses barcodeImages */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">BARCODE</span>
        </div>

        <div className="p-4 mb-6 min-h-48 flex items-center justify-center">
          {extractedData.barcodeImages.length > 0 ? (
            extractedData.barcodeImages.map((img: any, idx: number) => (
              <div
                key={img._id || idx}
                className="mx-2 flex items-center justify-center"
              >
                <PCFImageContent pcfImage={img} height={180} maxWidth={300} />
              </div>
            ))
          ) : (
            <div className="text-gray-500">No barcode images available</div>
          )}
        </div>

        {/* How to Pack Inner Carton Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">
            HOW TO PACK INNER CARTON OR INNER PACK IN OPP?
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="grid grid-cols-3 mb-2 items-center">
              <span className="font-bold mr-4">INNER PACK TYPE:</span>
              <select className="border border-gray-300 px-3 py-2 flex-1 rounded-md col-span-2">
                <option>Display with Inner Carton</option>
              </select>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-3 mb-2 items-center">
              <span className="font-bold mr-4">QTY / DESIGN:</span>
              <input

                type="text"
                className="border border-gray-300 px-3 py-2 rounded-md col-span-2"
                defaultValue={designStats.qtyPerDesign.toString()}
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="grid grid-cols-3 mb-2 items-center">
              <span className="font-bold mr-4">NUMBER OF DESIGN:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 rounded-md col-span-2"
                defaultValue={designStats.numberOfDesigns.toString()}
                readOnly
              />
            </div>
          </div>
          <div>
            <div className="grid grid-cols-3 mb-2 items-center">
              <span className="font-bold mr-4">TOTAL QTY / INNER:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 rounded-md col-span-2"
                defaultValue={designStats.totalQtyInner.toString()}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* ✅ UPDATED: Display Packing Section - Uses displayImages */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">DISPLAY PACKING</span>
        </div>

        <div className="pb-2">
          <input
            type="text"
            className="w-full p-4 border border-gray-300 text-sm rounded-md"
            placeholder="Description here..."
          />
        </div>

        <div className="p-4 mb-6">
          <div className="flex items-center justify-center space-x-4">
            {extractedData.displayImages.length > 0 ? (
              extractedData.displayImages.map((img: any, idx: number) => (
                <React.Fragment key={img._id || idx}>
                  {idx > 0 && (
                    <div className="text-3xl text-center">
                      {idx === extractedData.displayImages.length - 1 ? '=' : '+'}
                    </div>
                  )}
                  <div
                    className={`flex flex-col items-center ${
                      idx < 2 ? 'w-32 h-32' : 'w-48 h-32'
                    } bg-gray-100 border border-gray-300 mb-2 flex items-center justify-center`}
                  >
                    <PCFImageContent
                      pcfImage={img}
                      height={120}
                      maxWidth={idx < 2 ? 120 : 180}
                    />
                  </div>
                </React.Fragment>
              ))
            ) : (
              <div className="text-gray-500">No display images available</div>
            )}
          </div>
        </div>

        {/* ✅ UPDATED: Inner Carton Packing Section - Uses innerCartonImages + dimensions */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">INNER CARTON PACKING</span>
        </div>

        <div className="flex flex-col gap-4 mb-4">
          <div>
            <input
              type="text"
              className="w-full p-4 border border-gray-300 text-sm rounded-md"
              placeholder="Description here..."
            />
          </div>
          <span className="font-bold">INNER CARTON DIMENSION</span>
          <div className="flex gap-4 mb-4">
            <div>
              <span className="font-bold mr-2">LENGTH:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 max-w-24 rounded-md"
                defaultValue={assortment.baseAssortment?.inner_carton_length_cm || "0"}
              />
            </div>
            <div>
              <span className="font-bold mr-2">WIDTH:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 max-w-24 rounded-md"
                defaultValue={assortment.baseAssortment?.inner_carton_width_cm || "0"}
              />
            </div>
            <div>
              <span className="font-bold mr-2">HEIGHT:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 max-w-24 rounded-md"
                defaultValue={assortment.baseAssortment?.inner_carton_height_cm || "0"}
              />
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 mb-6">
            {extractedData.innerCartonImages.length > 0 ? (
              extractedData.innerCartonImages.map((img: any, idx: number) => (
                <React.Fragment key={img._id || idx}>
                  {idx > 0 && (
                    <div className="text-4xl">
                      {idx === extractedData.innerCartonImages.length - 1 ? '=' : '+'}
                    </div>
                  )}
                  <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center">
                    <PCFImageContent pcfImage={img} height={180} maxWidth={180} />
                  </div>
                </React.Fragment>
              ))
            ) : (
              <div className="text-gray-500">No inner carton images available</div>
            )}
          </div>
        </div>

        {/* ✅ UPDATED: Inner Carton/Pack Mark Section - Now uses actual image */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">INNER CARTON/PACK MARK</span>
        </div>

        <div className="flex flex-col mb-4">
          <div className="flex items-center gap-4 mb-4">
            <span className="font-bold">LOCATION:</span>
            <input
              type="text"
              className="border border-gray-300 px-3 py-2 w-sm rounded-md"
              defaultValue="2 MAIN SIDE OF THE INNER CARTON"
            />
          </div>
          <div className="flex items-center justify-center">
            {extractedData.innerCartonPackMark ? (
              <div className="border border-gray-300 p-2">
                <PCFImageContent 
                  pcfImage={extractedData.innerCartonPackMark} 
                  height={200} 
                  maxWidth={300} 
                />
              </div>
            ) : (
              <div className="text-gray-500">No shipping mark image uploaded</div>
            )}
          </div>
        </div>

        {/* How to Pack Master Carton Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">HOW TO PACK MASTER CARTON?</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="grid grid-cols-3 items-center">
              <span className="font-bold mr-4">MASTER CARTON PACK:</span>
              <select className="border border-gray-300 px-3 py-2 col-span-2 rounded-md">
                <option>Display with Inner Carton</option>
              </select>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-3 items-center">
              <span className="font-bold mr-4">
                NUMBER OF INNER PACK/CARTON:
              </span>
              <FormField
                control={form.control}
                name="productInCarton"
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="border border-gray-300 px-3 py-2 col-span-2 rounded-md"
                    defaultValue="4"
                    onBlur={handleOnBlurUpdate}
                    value={field.value?.toString() || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="grid grid-cols-3 items-center">
              <span className="font-bold mr-4">INNER PACK/CARTON QTY:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 col-span-2 rounded-md"
                defaultValue="3"
              />
            </div>
          </div>
          <div>
            <div className="grid grid-cols-3 items-center">
              <span className="font-bold mr-4">TOTAL QTY/MASTER CARTON:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 col-span-2 rounded-md"
                defaultValue="96"
              />
            </div>
          </div>
        </div>

        {/* ✅ UPDATED: Master Carton Pack Section - Uses masterCartonImages + dimensions */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">MASTER CARTON PACK</span>
        </div>

        <div className="flex flex-col gap-4 mb-4">
          <div>
            <input
              type="text"
              className="w-full p-4 border border-gray-300 text-sm rounded-md"
              placeholder="Description here..."
            />
          </div>

          <span className="font-bold">MASTER CARTON DIMENSION</span>
          <div className="flex gap-4 mb-4">
            <div>
              <span className="font-bold mr-2">LENGTH:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 max-w-24 rounded-md"
                defaultValue={assortment.baseAssortment?.master_carton_length_cm || "0"}
              />
            </div>
            <div>
              <span className="font-bold mr-2">WIDTH:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 max-w-24 rounded-md"
                defaultValue={assortment.baseAssortment?.master_carton_width_cm || "0"}
              />
            </div>
            <div>
              <span className="font-bold mr-2">HEIGHT:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 max-w-24 rounded-md"
                defaultValue={assortment.baseAssortment?.master_carton_height_cm || "0"}
              />
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 mb-6">
            {extractedData.masterCartonImages.length > 0 ? (
              extractedData.masterCartonImages.map((img: any, idx: number) => (
                <React.Fragment key={img._id || idx}>
                  {idx > 0 && (
                    <div className="text-4xl">
                      {idx === extractedData.masterCartonImages.length - 1 ? '=' : '+'}
                    </div>
                  )}
                  <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center">
                    <PCFImageContent pcfImage={img} height={180} maxWidth={180} />
                  </div>
                </React.Fragment>
              ))
            ) : (
              <div className="text-gray-500">No master carton images available</div>
            )}
          </div>
        </div>

        {/* ✅ UPDATED: Main Shipping Mark Section - Now uses actual image */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">MAIN SHIPPING MARK</span>
        </div>

        <div className="p-4 mb-4">
          <div className="mb-4">
            <span className="font-bold mr-4">LOCATION:</span>
            <input
              type="text"
              className="border border-gray-300 px-3 py-2 w-sm rounded-md"
              defaultValue="2 MAIN SIDE OF THE MASTER CARTON"
            />
          </div>

          <div className="flex items-center justify-center">
            {extractedData.mainShippingMark ? (
              <div className="border border-gray-300 p-2">
                <PCFImageContent 
                  pcfImage={extractedData.mainShippingMark} 
                  height={250} 
                  maxWidth={350} 
                />
              </div>
            ) : ( 
              <div className="text-gray-500">No main shipping mark image uploaded</div>    
            )}
          </div>
        </div>

        {/* ✅ UPDATED: Side Shipping Mark Section - Now uses actual image */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">SIDE SHIPPING MARK</span>
        </div>

        <div className="p-4 mb-4">
          <div className="mb-4">
            <span className="font-bold mr-4">LOCATION:</span>
            <input
              type="text"
              className="border border-gray-300 px-3 py-2 w-sm rounded-md"
              defaultValue="2 SHORT SIDE OF THE MASTER CARTON"
            />
          </div>
          <div className="flex items-center justify-center">
            {extractedData.sideShippingMark ? (
              <div className="border border-gray-300 p-2">
                <PCFImageContent 
                  pcfImage={extractedData.sideShippingMark} 
                  height={200} 
                  maxWidth={300} 
                />
              </div>
            ) : (     
              <div className="text-gray-500">No side shipping mark image uploaded</div>
            )}
          </div>
        </div>
      </div>
    </Form>
  );
});