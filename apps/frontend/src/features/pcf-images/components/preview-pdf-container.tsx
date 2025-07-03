import { EditableField } from '@/components/editable-field';
import { Form, FormField } from '@/components/ui/form';
import { AssortmentPCF } from '@/features/assortments';
import {
  EditAssortmentDTO,
  editAssormentSchema,
  useEditAssortment,
} from '@/features/assortments/api/editAssortment';
import { useGetSalesOrderOrderId } from '@/features/sales-orders/api/getSaleOrderByOrderId';
import { groupPCFImages } from '@/utils/pcf-util';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import React from 'react';
import { useForm } from 'react-hook-form';
import { PCFImageContent } from '..';

interface PreviewPDFContainerProps {
  assortment: AssortmentPCF;
}

export const PreviewPDFContainer = React.forwardRef<
  HTMLDivElement,
  PreviewPDFContainerProps
>((props, ref) => {
  const { assortment } = props;
  const { data: orderData } = useGetSalesOrderOrderId(assortment?.orderId || 0);

  const groupedImages = groupPCFImages(assortment?.pcfImages || []);

  const today = format(new Date(), 'MMMM-dd,yyyy');

  // Extract images based on the new schema sections
  const itemPackImages = groupedImages.itemPackImages || [];
  const itemBarcodeImages = groupedImages.itemBarcodeImages || [];
  const displayImages = groupedImages.displayImages || [];
  const innerCartonImages = groupedImages.innerCartonImages || [];
  const masterCartonImages = groupedImages.masterCartonImages || [];

  const edit = useEditAssortment();

  const form = useForm<EditAssortmentDTO>({
    resolver: zodResolver(editAssormentSchema),
  });

  const [isFocused, setFocused] = React.useState(false);

  const handleOnBlurUpdate = () => {
    setFocused(true);
  };

  const isDirty = form.formState.isDirty;

  React.useEffect(() => {
    if (isDirty && isFocused) {
      const values = form.getValues();
      edit.mutate(values);
    } else {
      setFocused(false);
    }
  }, [isDirty, isFocused]);

  const resetForm = React.useCallback(() => {
    const labels = assortment.labels?.find((label) =>
      label.hasOwnProperty('unit'),
    );

    const unitVal = labels?.['unit'].value ?? 'PR';

    form.reset({
      _id: assortment._id,
      productInCarton:
        assortment.itemInCarton || assortment.productInCarton || 0,
      productPerUnit: assortment.itemPerUnit || assortment.productPerUnit || 0,
      unit: assortment.unit ?? unitVal,
      masterCUFT:
        assortment.itemCUFT || parseFloat(assortment.masterCUFT ?? '0'),
      cubicUnit: assortment.cubicUnit ?? 'cuft',
      masterGrossWeight:
        assortment.itemGrossWeight ||
        parseFloat(assortment.masterGrossWeight ?? '0'),
      wtUnit: assortment.wtUnit ?? 'lbs',
    });
  }, [assortment, form]);

  React.useEffect(() => {
    resetForm();
    setFocused(false);
  }, [resetForm]);

  return (
    <Form {...form}>
      <div ref={ref} className="w-full max-w-4xl mx-auto bg-white">
        {/* Header Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-lg font-bold">PACKING INSTRUCTION</span>
        </div>

        {/* Basic Info Section */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">DESCRIPTIONS:</span>
              <input
                type="text"
                className="ml-2 border border-gray-300 px-2 py-1 w-64 rounded-md"
                defaultValue={
                  assortment.name || 'Beer Opener Keychain with Display'
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">ITEM NUMBER:</span>
              <input
                type="text"
                className="ml-2 border border-gray-300 px-2 py-1 w-32 rounded-md"
                defaultValue={assortment.itemNo || 'A000026'}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">CUSTOMER ITEM NUMBER:</span>
              <input
                type="text"
                className="ml-2 border border-gray-300 px-2 py-1 w-32 rounded-md"
                defaultValue={assortment.customerItemNo || 'FAR-0013'}
              />
            </div>
          </div>
        </div>

        {/* Finish Product Images Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">FINISH PRODUCT IMAGES</span>
        </div>

        <div className="border border-gray-300 p-4 mb-6 min-h-64 flex items-center justify-center">
          <PCFImageContent
            pcfImage={itemPackImages[0]}
            height={240}
            maxWidth={400}
          />
        </div>

        {/* How to Pack Single Product Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">
            HOW TO PACK THE SINGLE PRODUCT?
          </span>
        </div>

        <div className="border border-gray-300 p-4 mb-4">
          <textarea
            className="w-full h-16 p-2 border border-gray-300 text-sm rounded-md"
            placeholder="1 PC with one basket card put into OPP Bag OPP"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="font-medium mr-4">LABEL TYPE:</span>
            <select className="border border-gray-300 px-3 py-1 rounded-md">
              <option>Non - Removable</option>
            </select>
          </div>
        </div>

        {/* Product Assembly Visualization */}
        <div className="border border-gray-300 p-4 mb-6">
          <div className="flex items-center justify-center space-x-8">
            <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center">
              <PCFImageContent
                pcfImage={itemPackImages[0]}
                height={180}
                maxWidth={180}
              />
            </div>
            <div className="text-4xl font-bold">+</div>
            <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center">
              <PCFImageContent
                pcfImage={itemPackImages[1]}
                height={180}
                maxWidth={180}
              />
            </div>
            <div className="text-4xl">→</div>
            <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center">
              <PCFImageContent
                pcfImage={itemPackImages[2]}
                height={180}
                maxWidth={180}
              />
            </div>
          </div>
        </div>

        {/* Barcode Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">BARCODE</span>
        </div>

        <div className="border border-gray-300 p-4 mb-6 min-h-48 flex items-center justify-center">
          <PCFImageContent
            pcfImage={itemBarcodeImages[0]}
            height={180}
            maxWidth={300}
          />
        </div>

        {/* How to Pack Inner Carton Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">
            HOW TO PACK INNER CARTON OR INNER PACK IN OPP?
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center mb-2">
              <span className="font-medium mr-4">INNER PACK TYPE:</span>
              <select className="border border-gray-300 px-3 py-1 flex-1 rounded-md">
                <option>Display with Inner Carton</option>
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <span className="font-medium mr-4">QTY / DESIGN:</span>
              <FormField
                control={form.control}
                name="productPerUnit"
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="border border-gray-300 px-2 py-1 w-16 rounded-md"
                    defaultValue="8"
                    onBlur={handleOnBlurUpdate}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="flex items-center mb-2">
              <span className="font-medium mr-4">NUMBER OF DESIGN:</span>
              <input
                type="text"
                className="border border-gray-300 px-2 py-1 w-16 rounded-md"
                defaultValue="3"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <span className="font-medium mr-4">TOTAL QTY / INNER:</span>
              <input
                type="text"
                className="border border-gray-300 px-2 py-1 w-16 rounded-md"
                defaultValue="24"
              />
            </div>
          </div>
        </div>

        {/* Display Packing Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">DISPLAY PACKING</span>
        </div>

        <div className="border border-gray-300 p-4 mb-6">
          <div className="grid grid-cols-4 gap-4 items-center">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-100 border border-gray-300 mb-2 flex items-center justify-center">
                <PCFImageContent
                  pcfImage={displayImages[0]}
                  height={120}
                  maxWidth={120}
                />
              </div>
            </div>
            <div className="text-3xl text-center">+</div>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-100 border border-gray-300 mb-2 flex items-center justify-center">
                <PCFImageContent
                  pcfImage={displayImages[1]}
                  height={120}
                  maxWidth={120}
                />
              </div>
            </div>
            <div className="text-3xl text-center">+</div>
          </div>

          <div className="flex items-center justify-center mt-4">
            <div className="text-3xl mr-4">+</div>
            <div className="w-48 h-32 bg-gray-100 border border-gray-300 mr-4 flex items-center justify-center">
              <PCFImageContent
                pcfImage={displayImages[2]}
                height={120}
                maxWidth={180}
              />
            </div>
            <div className="text-3xl mr-4">→</div>
            <div className="w-48 h-32 bg-gray-100 border border-gray-300 flex items-center justify-center">
              <PCFImageContent
                pcfImage={displayImages[3]}
                height={120}
                maxWidth={180}
              />
            </div>
          </div>
        </div>

        {/* Inner Carton Packing Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">INNER CARTON PACKING</span>
        </div>

        <div className="border border-gray-300 p-4 mb-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <span className="font-medium mr-2">LENGTH:</span>
              <input
                type="text"
                className="border border-gray-300 px-2 py-1 w-16 rounded-md"
                defaultValue="3"
              />
            </div>
            <div>
              <span className="font-medium mr-2">WIDTH:</span>
              <input
                type="text"
                className="border border-gray-300 px-2 py-1 w-16 rounded-md"
                defaultValue="3"
              />
            </div>
            <div>
              <span className="font-medium mr-2">HEIGHT:</span>
              <input
                type="text"
                className="border border-gray-300 px-2 py-1 w-16 rounded-md"
                defaultValue="3"
              />
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 mb-6">
            <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center">
              <PCFImageContent
                pcfImage={innerCartonImages[0]}
                height={180}
                maxWidth={180}
              />
            </div>
            <div className="text-4xl">+</div>
            <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center">
              <PCFImageContent
                pcfImage={innerCartonImages[1]}
                height={180}
                maxWidth={180}
              />
            </div>
            <div className="text-4xl">→</div>
            <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center">
              <PCFImageContent
                pcfImage={innerCartonImages[2]}
                height={180}
                maxWidth={180}
              />
            </div>
          </div>
        </div>

        {/* Inner Carton/Pack Mark Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">INNER CARTON/PACK MARK</span>
        </div>

        <div className="border border-gray-300 p-4 mb-4">
          <div className="mb-4">
            <span className="font-medium mr-4">LOCATION:</span>
            <input
              type="text"
              className="border border-gray-300 px-2 py-1 w-80 rounded-md"
              defaultValue="2 MAIN SIDE OF THE INNER CARTON"
            />
          </div>
          <div className="flex items-center justify-center">
            <div className="flex flex-col border border-black p-8 max-w-[300px] bg-white text-left">
              <div className="text-lg font-bold">SPLASH</div>
              <div className="text-lg font-bold">ITEM NO.: ONE73S</div>
              <div className="text-lg font-bold">MADE IN CHINA</div>
              <div className="text-lg font-bold">QTY: 1 SET</div>
            </div>
          </div>
        </div>

        {/* How to Pack Master Carton Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">HOW TO PACK MASTER CARTON?</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center mb-2">
              <span className="font-medium mr-4">MASTER CARTON PACK:</span>
              <select className="border border-gray-300 px-3 py-1 flex-1 rounded-md">
                <option>Display with Inner Carton</option>
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <span className="font-medium mr-4">
                NUMBER OF INNER PACK/CARTON:
              </span>
              <FormField
                control={form.control}
                name="productInCarton"
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="border border-gray-300 px-2 py-1 w-16 rounded-md"
                    defaultValue="4"
                    onBlur={handleOnBlurUpdate}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="flex items-center mb-2">
              <span className="font-medium mr-4">INNER PACK/CARTON QTY:</span>
              <input
                type="text"
                className="border border-gray-300 px-2 py-1 w-16 rounded-md"
                defaultValue="3"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <span className="font-medium mr-4">TOTAL QTY/MASTER CARTON:</span>
              <input
                type="text"
                className="border border-gray-300 px-2 py-1 w-16 rounded-md"
                defaultValue="96"
              />
            </div>
          </div>
        </div>

        {/* Master Carton Pack Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">MASTER CARTON PACK</span>
        </div>

        <div className="border border-gray-300 p-4 mb-4">
          <div className="text-sm mb-4 space-y-1">
            <div>
              1. 4 Inner Pack will go in 1 master carton (96Pcs in total)
            </div>
            <div>
              2. Put 2 Male Marks &amp; 2 Side marks on the Master Carton
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <span className="font-medium mr-2">LENGTH:</span>
              <input
                type="text"
                className="border border-gray-300 px-2 py-1 w-16 rounded-md"
                defaultValue="3"
              />
            </div>
            <div>
              <span className="font-medium mr-2">WIDTH:</span>
              <input
                type="text"
                className="border border-gray-300 px-2 py-1 w-16 rounded-md"
                defaultValue="3"
              />
            </div>
            <div>
              <span className="font-medium mr-2">HEIGHT:</span>
              <input
                type="text"
                className="border border-gray-300 px-2 py-1 w-16 rounded-md"
                defaultValue="3"
              />
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8">
            <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center">
              <PCFImageContent
                pcfImage={innerCartonImages[0]}
                height={180}
                maxWidth={180}
              />
            </div>
            <div className="text-4xl">→</div>
            <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center">
              <PCFImageContent
                pcfImage={masterCartonImages[0]}
                height={180}
                maxWidth={180}
              />
            </div>
          </div>
        </div>

        {/* Main Shipping Mark Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">MAIN SHIPPING MARK</span>
        </div>

        <div className="border border-gray-300 p-4 mb-4">
          <div className="mb-4">
            <span className="font-medium mr-4">LOCATION:</span>
            <input
              type="text"
              className="border border-gray-300 px-2 py-1 w-80 rounded-md"
              defaultValue="2 MAIN SIDE OF THE MASTER CARTON"
            />
          </div>

          <div className="flex items-center justify-center">
            <div className="border border-black p-4 bg-white text-center min-w-[300px]">
              <div className="flex justify-end space-x-4 mb-4">
                <div className="w-8 h-8 border border-black flex items-center justify-center">
                  ⚘
                </div>
                <div className="w-8 h-8 border border-black flex items-center justify-center">
                  🍷
                </div>
                <div className="w-8 h-8 border border-black flex items-center justify-center">
                  ⬆
                </div>
              </div>
              <div className="flex flex-col text-left">
                <div className="text-lg font-bold">SPLASH</div>
                <div className="text-lg font-bold">ITEM NO.: ONE73S</div>
                <div className="text-lg font-bold">P.O. NO.: 16713</div>
                <div className="text-lg font-bold">MADE IN CHINA</div>
                <div className="text-lg font-bold">CTN. NO.: ___/15</div>
                <div className="text-lg font-bold">082024</div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Shipping Mark Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">SIDE SHIPPING MARK</span>
        </div>

        <div className="border border-gray-300 p-4 mb-4">
          <div className="mb-4">
            <span className="font-medium mr-4">LOCATION:</span>
            <input
              type="text"
              className="border border-gray-300 px-2 py-1 w-80 rounded-md"
              defaultValue="2 SHORT SIDE OF THE MASTER CARTON"
            />
          </div>
          <div className="flex items-center justify-center">
            <div className="border border-black p-1 bg-white text-left max-w-[300px]">
              <div className="text-lg font-bold">QTY: 4 SETS</div>
              <div className="text-lg font-bold">
                G.W.: {form.watch('masterGrossWeight') || '___'}
                {form.watch('wtUnit') || 'KGS'}
              </div>
              <div className="text-lg font-bold">N. W.: ___KGS</div>
              <div className="text-lg font-bold">
                MEAS: {form.watch('masterCUFT') || '___'}
                {form.watch('cubicUnit') === 'cuft' ? 'CM' : 'CM'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
});
