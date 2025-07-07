// import { EditableField } from '@/components/editable-field';
import { Form, FormField } from '@/components/ui/form';
import { AssortmentPCF } from '@/features/assortments';
import {
  UpdateAssortmentDTO,
  updateAssortmentSchema,
  useUpdateAssortment,
} from '@/features/assortments/api/updateAssortment';
// import { useGetSalesOrderOrderId } from '@/features/sales-orders/api/getSaleOrderByOrderId';
import { groupPCFImages } from '@/utils/pcf-util';
import { zodResolver } from '@hookform/resolvers/zod';
// import { format } from 'date-fns';
import React from 'react';
import { useForm } from 'react-hook-form';
import { PCFImageContent } from '..';
import fragile from '../../../assets/img/packaging-icons/Fragile.jpg';
import handleWithCare from '../../../assets/img/packaging-icons/Handle-With-Care.jpg';
import thisWayUp from '../../../assets/img/packaging-icons/This-Way-Up.jpg';

interface PreviewPDFContainerProps {
  assortment: AssortmentPCF;
}

export const PreviewPDFContainer = React.forwardRef<
  HTMLDivElement,
  PreviewPDFContainerProps
>((props, ref) => {
  const { assortment } = props;
  // const { data: orderData } = useGetSalesOrderOrderId(assortment?.orderId || 0);

  const groupedImages = groupPCFImages(assortment?.pcfImages || []);

  // const today = format(new Date(), 'MMMM-dd,yyyy');

  // Extract images based on the new schema sections
  const itemPackImages = groupedImages.itemPackImages || [];
  const itemBarcodeImages = groupedImages.itemBarcodeImages || [];
  const displayImages = groupedImages.displayImages || [];
  const innerCartonImages = groupedImages.innerCartonImages || [];
  const masterCartonImages = groupedImages.masterCartonImages || [];

  const update = useUpdateAssortment();

  const form = useForm<UpdateAssortmentDTO>({
    resolver: zodResolver(updateAssortmentSchema),
  });

  const [isFocused, setFocused] = React.useState(false);

  const handleOnBlurUpdate = () => {
    setFocused(true);
  };

  const isDirty = form.formState.isDirty;

  React.useEffect(() => {
    if (isDirty && isFocused) {
      const values = form.getValues();
      update.mutate(values);
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
                assortment.name || 'Beer Opener Keychain with Display'
              }
            />
          </div>
          <div className="grid grid-cols-5 gap-4 items-center">
            <span className="font-bold">ITEM NUMBER:</span>
            <input
              type="text"
              className="ml-2 border border-gray-300 px-3 py-2 col-span-2 rounded-md"
              defaultValue={assortment.itemNo || 'A000026'}
            />
          </div>
          <div className="grid grid-cols-5 gap-4 items-center">
            <span className="font-bold">CUSTOMER ITEM NUMBER:</span>
            <input
              type="text"
              className="ml-2 border border-gray-300 px-3 py-2 col-span-2 rounded-md"
              defaultValue={assortment.customerItemNo || 'FAR-0013'}
            />
          </div>
        </div>

        {/* Finish Product Images Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">FINISH PRODUCT IMAGES</span>
        </div>

        <div className="p-4 mb-6 min-h-64 flex items-center justify-center">
          {itemPackImages.map((img, idx) => (
            <div
              key={img._id || idx}
              className="mx-2 flex items-center justify-center"
            >
              <PCFImageContent pcfImage={img} height={240} maxWidth={400} />
            </div>
          ))}
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

        {/* Product Assembly Visualization */}
        <div className="p-4 mb-6">
          <div className="flex items-center justify-center space-x-8">
            {itemPackImages.map((img, idx) => (
              <React.Fragment key={img._id || idx}>
                {idx > 0 && (
                  <div className="text-4xl font-bold">
                    {idx === itemPackImages.length - 1 ? '→' : '+'}
                  </div>
                )}
                <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center">
                  <PCFImageContent pcfImage={img} height={180} maxWidth={180} />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Barcode Section */}
        <div className="bg-black text-white text-center py-2 mb-4">
          <span className="text-sm font-bold">BARCODE</span>
        </div>

        <div className="p-4 mb-6 min-h-48 flex items-center justify-center">
          {itemBarcodeImages.map((img, idx) => (
            <div
              key={img._id || idx}
              className="mx-2 flex items-center justify-center"
            >
              <PCFImageContent pcfImage={img} height={180} maxWidth={300} />
            </div>
          ))}
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
              <FormField
                control={form.control}
                name="productPerUnit"
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="border border-gray-300 px-3 py-2 rounded-md col-span-2"
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
            <div className="grid grid-cols-3 mb-2 items-center">
              <span className="font-bold mr-4">NUMBER OF DESIGN:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 rounded-md col-span-2"
                defaultValue="3"
              />
            </div>
          </div>
          <div>
            <div className="grid grid-cols-3 mb-2 items-center">
              <span className="font-bold mr-4">TOTAL QTY / INNER:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 rounded-md col-span-2"
                defaultValue="24"
              />
            </div>
          </div>
        </div>

        {/* Display Packing Section */}
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
            {displayImages.map((img, idx) => (
              <React.Fragment key={img._id || idx}>
                {idx > 0 && (
                  <div className="text-3xl text-center">
                    {idx === displayImages.length - 1 ? '→' : '+'}
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
            ))}
          </div>
        </div>

        {/* Inner Carton Packing Section */}
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
                defaultValue="3"
              />
            </div>
            <div>
              <span className="font-bold mr-2">WIDTH:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 max-w-24 rounded-md"
                defaultValue="3"
              />
            </div>
            <div>
              <span className="font-bold mr-2">HEIGHT:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 max-w-24 rounded-md"
                defaultValue="3"
              />
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 mb-6">
            {innerCartonImages.map((img, idx) => (
              <React.Fragment key={img._id || idx}>
                {idx > 0 && (
                  <div className="text-4xl">
                    {idx === innerCartonImages.length - 1 ? '→' : '+'}
                  </div>
                )}
                <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center">
                  <PCFImageContent pcfImage={img} height={180} maxWidth={180} />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Inner Carton/Pack Mark Section */}
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
            <div className="flex flex-col border border-black py-3 px-5 bg-white text-left">
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

        {/* Master Carton Pack Section */}
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
                defaultValue="3"
              />
            </div>
            <div>
              <span className="font-bold mr-2">WIDTH:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 max-w-24 rounded-md"
                defaultValue="3"
              />
            </div>
            <div>
              <span className="font-bold mr-2">HEIGHT:</span>
              <input
                type="text"
                className="border border-gray-300 px-3 py-2 max-w-24 rounded-md"
                defaultValue="3"
              />
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 mb-6">
            {masterCartonImages.map((img, idx) => (
              <React.Fragment key={img._id || idx}>
                {idx > 0 && (
                  <div className="text-4xl">
                    {idx === masterCartonImages.length - 1 ? '→' : '+'}
                  </div>
                )}
                <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center">
                  <PCFImageContent pcfImage={img} height={180} maxWidth={180} />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Shipping Mark Section */}
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
            <div className="border border-black p-4 bg-white text-center min-w-[300px]">
              <div className="flex justify-end space-x-4 mb-4">
                <img
                  src={handleWithCare}
                  alt="Handle With Care"
                  className="w-8 h-8 border border-black object-contain"
                />
                <img
                  src={fragile}
                  alt="Fragile"
                  className="w-8 h-8 border border-black object-contain"
                />
                <img
                  src={thisWayUp}
                  alt="This Way Up"
                  className="w-8 h-8 border border-black object-contain"
                />
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
            <div className="border border-black p-2 bg-white text-left max-w-[300px]">
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
