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
import { ProductSection } from './container-product-section';
import { ProtectedSection } from './container-protected-section';

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
  const masterUccLabel = groupedImages.masterUccLabel?.[0];
  const innerItemLabel = groupedImages.innerItemLabel?.[0];
  const innerUccLabel = groupedImages.innerUccLabel?.[0];
  const upcLabelFront = groupedImages.upcLabelFront?.[0];
  const upcLabelBack = groupedImages.upcLabelBack?.[0];
  const masterCarton = groupedImages.masterCarton?.[0];
  const innerCarton = groupedImages.innerCarton?.[0];
  const masterShippingMark = groupedImages.masterShippingMark?.[0];
  const innerItemUccLabel = groupedImages.innerItemUccLabel?.[0];

  const upcPlacement = groupedImages.upcPlacement || [];
  const productPictures = groupedImages.productPictures || [];
  const protectivePackaging = groupedImages.protectivePackaging || [];

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
      <div ref={ref} className="pdf-container">
        <div className="pdf-header-container pdf-title-container">
          <span>GIFTCRAFT PACKAGING CONFIRMATION FORM</span>
        </div>
        <table>
          <tbody>
            <tr>
              <td>
                <span className="pdf-text">Vendor Name:</span>
                <span className="pdf-text">1000 Miles Limited</span>
              </td>
              <td
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <div>
                  <span className="pdf-text">Vendor Code: </span>
                  <span className="pdf-text">10001</span>
                </div>
                <div>
                  <span className="pdf-text">Date: </span>
                  <span className="pdf-text">{today}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <span className="pdf-text">P.O. #: </span>
                <span className="pdf-text">{orderData?.customerPoNo}</span>
              </td>
              <td className="d-flex">
                <span className="pdf-text">Item #: </span>
                <span className="pdf-text">{assortment.customerItemNo}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="pdf-section-container" style={{ width: '160px' }}>
          <span>Master Carton</span>
        </div>
        <div className="pdf-header-container">
          <table>
            <tbody>
              <tr>
                <td>
                  <span
                    style={{
                      fontWeight: 'bold',
                    }}
                  >
                    Shipping Mark - Print of four sides of the carton
                  </span>
                </td>
                <td>
                  <span>UCC 128 Label for Master Carton</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <table>
          <tbody>
            <tr>
              <td className="border-full">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    flexDirection: 'column',
                    height: '100%',
                    gap: '5px',
                  }}
                >
                  <div>
                    <div
                      className="image-container"
                      style={{
                        width: '60%',
                      }}
                    >
                      <img
                        style={{
                          height: '80px',
                          objectFit: 'contain',
                        }}
                        src="/api/static/images/gc_logo.png"
                        alt="gc_logo"
                      />
                    </div>
                    <table className="w-50">
                      <tbody>
                        <tr>
                          <td className="pdf-text">ITEM #:</td>
                          <td className="pdf-text">
                            {assortment.customerItemNo}
                          </td>
                        </tr>
                        <tr>
                          <td className="pdf-text">PO #:</td>
                          <td className="pdf-text">
                            {orderData?.customerPoNo}
                          </td>
                        </tr>
                        <tr>
                          <td className="pdf-text">QTY.:</td>
                          <td className="d-flex" style={{ gap: '5px' }}>
                            <FormField
                              control={form.control}
                              name="productInCarton"
                              render={({ field }) => (
                                <EditableField
                                  className="pdf-text form-control"
                                  {...field}
                                  onBlurField={handleOnBlurUpdate}
                                />
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="unit"
                              render={({ field }) => (
                                <EditableField
                                  className="pdf-text form-control"
                                  {...field}
                                  onBlurField={handleOnBlurUpdate}
                                />
                              )}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="pdf-text">CUBIC MEAS.:</td>
                          <td className="d-flex" style={{ gap: '5px' }}>
                            <FormField
                              control={form.control}
                              name="masterCUFT"
                              render={({ field }) => (
                                <EditableField
                                  className="pdf-text form-control"
                                  {...field}
                                  isParse
                                  onBlurField={handleOnBlurUpdate}
                                />
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="cubicUnit"
                              render={({ field }) => (
                                <EditableField
                                  className="pdf-text form-control"
                                  {...field}
                                  onBlurField={handleOnBlurUpdate}
                                />
                              )}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="pdf-text">GROSS WT:</td>
                          <td className="d-flex" style={{ gap: '5px' }}>
                            <FormField
                              control={form.control}
                              name="masterGrossWeight"
                              render={({ field }) => (
                                <EditableField
                                  className="pdf-text form-control"
                                  {...field}
                                  isParse
                                  onBlurField={handleOnBlurUpdate}
                                />
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="wtUnit"
                              render={({ field }) => (
                                <EditableField
                                  className="pdf-text form-control"
                                  {...field}
                                  onBlurField={handleOnBlurUpdate}
                                />
                              )}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div>
                      <span className="pdf-text">
                        MADE IN China / FABRIQUE EN Chine
                      </span>
                    </div>
                  </div>
                  <div className="pdf-text pdf-flex-default align-items-center">
                    <span>
                      <strong> CUSTOMER SERVICE </strong>
                    </span>
                    <span>
                      <strong>CANADA</strong> 1-877-387-9777 /
                      <strong>U.S.A.</strong> 1-877-387-4888
                    </span>
                    <a href="https://www.giftcraft.com">www.giftcraft.com </a>
                  </div>
                </div>
              </td>
              <td className="border-full">
                <div
                  className="pdf-flex-default"
                  style={{
                    padding: '10px 0 5px',
                  }}
                >
                  <span className="pdf-text">
                    Attach a jpeg scan of the actual UCC label.
                  </span>
                  <span className="pdf-text">
                    pictures of UCC labels cannot be read by a barcode reader
                    device.
                  </span>
                </div>
                <div
                  className="image-container"
                  style={{
                    padding: '2px',
                    minHeight: '240px',
                  }}
                >
                  <PCFImageContent
                    pcfImage={masterUccLabel}
                    height={240}
                    maxWidth={450}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="pdf-section-container" style={{ width: '160px' }}>
          <span>Inner Carton</span>
        </div>
        <div className="pdf-header-container">
          <table>
            <tbody>
              <tr>
                <td>
                  <span
                    style={{
                      fontWeight: 'bold',
                    }}
                  >
                    Shipping Mark - Print on one side of the carton
                  </span>
                </td>
                <td>
                  <span>UCC 128 Label for Inner Carton</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <table>
          <tbody>
            <tr>
              <td className="border-full">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '20px',
                  }}
                >
                  <div
                    style={{
                      width: '150px',
                    }}
                  >
                    <table>
                      <tbody>
                        <tr>
                          <td className="pdf-text">ITEM #:</td>
                          <td>{assortment.customerItemNo}</td>
                        </tr>
                        <tr>
                          <td className="pdf-text">QTY.:</td>
                          <td className="d-flex" style={{ gap: '5px' }}>
                            <FormField
                              control={form.control}
                              name="productPerUnit"
                              render={({ field }) => (
                                <EditableField
                                  className="pdf-text form-control"
                                  {...field}
                                  onBlurField={handleOnBlurUpdate}
                                />
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="unit"
                              render={({ field }) => (
                                <EditableField
                                  className="pdf-text form-control"
                                  {...field}
                                  onBlurField={handleOnBlurUpdate}
                                />
                              )}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="image-container" style={{ height: '200px' }}>
                    <PCFImageContent
                      pcfImage={innerItemLabel}
                      height={200}
                      maxWidth={350}
                    />
                  </div>
                </div>
              </td>
              <td className="border-full">
                <div
                  className="pdf-flex-default"
                  style={{
                    padding: '15px 0 5px',
                  }}
                >
                  <span className="pdf-text">
                    Attach a jpeg scan of the actual UCC label. Digital pictures
                    of
                  </span>
                  <span className="pdf-text">
                    UCC labels cannot be read by a barcode reader device.
                  </span>
                </div>
                <div className="image-container" style={{ height: '160px' }}>
                  <PCFImageContent
                    pcfImage={innerUccLabel}
                    height={160}
                    maxWidth={350}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="d-flex align-items-center">
          <div className="pdf-section-container" style={{ width: '160px' }}>
            <span>UPC Label</span>
          </div>
          <span
            className="pdf-text"
            style={{
              paddingLeft: '10px',
            }}
          >
            To be placed on each product
          </span>
        </div>
        <table>
          <tbody>
            <tr
              style={{
                height: '315px',
              }}
            >
              <td className="border-full">
                <div className="pdf-flex-default">
                  <span className="pdf-text fw-bold">Front of UPC label</span>
                  <span className="pdf-text">
                    Attach a jpeg scan of the actual UCC label. Digital pictures
                    of
                  </span>
                  <span className="pdf-text">
                    UCC labels cannot be read by a barcode reader device.
                  </span>
                </div>
                <div
                  className="border-t border-r image-container"
                  style={{
                    marginTop: '5px',
                    width: 'fit-content',
                    minWidth: '275px',
                    height: '265px',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <PCFImageContent
                    pcfImage={upcLabelFront}
                    height={260}
                    maxWidth={375}
                  />
                </div>
              </td>
              <td className="border-full">
                <div className="pdf-flex-default">
                  <span className="pdf-text fw-bold">Front of UPC label</span>
                  <span className="pdf-text">
                    Attach a jpeg scan of the actual UCC label. Digital pictures
                    of
                  </span>
                  <span className="pdf-text">
                    UCC labels cannot be read by a barcode reader device.
                  </span>
                </div>
                <div
                  className="border-t border-r image-container"
                  style={{
                    marginTop: '5px',
                    width: 'fit-content',
                    minWidth: '275px',
                    height: '265px',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <PCFImageContent
                    pcfImage={upcLabelBack}
                    height={260}
                    maxWidth={375}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="pdf-flex-default border-l">
          <span className="pdf-text fw-bold">
            Pictures of UPC Placement on product
          </span>
          <span className="text-default">
            Attach digital pictures of product with UPC codes attached.
          </span>
        </div>
        <div className="position-relative border-full">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              width: '100%',
              gap: '10px',
              minHeight: '200px',
              padding: '2px',
            }}
          >
            {upcPlacement.map((image) => (
              <PCFImageContent
                key={image._id}
                pcfImage={image}
                height={200}
                maxWidth={450}
              />
            ))}
          </div>
        </div>
        <br />
        <table
          style={{
            // pageBreakBefore: 'always',
            pageBreakInside: 'avoid',
          }}
        >
          <tbody>
            <tr
              style={{
                backgroundColor: '#c0c0c0',
              }}
            >
              <td className="border-full text-center">
                <span className="pdf-text fw-bold text-center">
                  Master Carton Markings Pictures
                </span>
              </td>
              <td className="border-full text-center">
                <span className="pdf-text fw-bold text-center">
                  Inner Carton Markings Pictures
                </span>
              </td>
            </tr>
            <tr>
              <td className="border-full" style={{ borderBottom: 'none' }}>
                <span>
                  Attach digital picture of master carton markings here.
                </span>
                <div className="image-container" style={{ minHeight: '100px' }}>
                  <PCFImageContent
                    pcfImage={masterCarton}
                    height={325}
                    maxWidth={450}
                  />
                </div>
              </td>
              <td className="border-full" style={{ borderBottom: 'none' }}>
                <span>Attach a picture of inner carton markings here.</span>
                <div className="image-container" style={{ minHeight: '100px' }}>
                  <PCFImageContent
                    pcfImage={innerCarton}
                    height={325}
                    maxWidth={450}
                  />
                </div>
              </td>
            </tr>

            <tr>
              <td className="border-full" style={{ borderTop: 'none' }}>
                <div
                  className="mt-4 image-container"
                  style={{ minHeight: '100px' }}
                >
                  <PCFImageContent
                    pcfImage={masterShippingMark}
                    height={350}
                    maxWidth={450}
                  />
                </div>
              </td>
              <td className="border-full" style={{ borderTop: 'none' }}>
                <div
                  className="mt-4 image-container"
                  style={{ minHeight: '100px' }}
                >
                  <PCFImageContent
                    pcfImage={innerItemUccLabel}
                    height={350}
                    maxWidth={450}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            pageBreakInside: 'avoid',
          }}
        >
          <div className="pdf-section-container justify-content-center">
            <span>Product Pictures</span>
          </div>
          {/* Images section  */}
          <ProductSection pcfImages={productPictures} />
        </div>
        <div
          style={{
            pageBreakInside: 'avoid',
          }}
        >
          <div className="pdf-section-container justify-content-center">
            <span>Protective Packaging Pictures</span>
          </div>
          {/* Images section  */}
          <ProtectedSection pcfImages={protectivePackaging} />
        </div>
        <div
          style={{
            pageBreakInside: 'avoid',
          }}
        >
          <div className="pdf-section-container justify-content-center">
            <span>
              Additional Space for pictures or description of protective
              packaging.
            </span>
          </div>
          <div className="border-full" style={{ height: '200px' }}></div>
          <table>
            <tbody>
              <tr className="border-full">
                <td className="border-full">
                  <div className="d-flex flex-column">
                    <span className="fw-bold" style={{ fontSize: '9pt' }}>
                      Inner carton packaging passes 90 cm drop test: YES
                    </span>
                    <span style={{ fontSize: '9pt' }}>
                      Inner carton packaging passes others: _ _ _ _ _ _ _ _ _ _
                      _<strong>YES</strong>
                    </span>
                  </div>
                </td>
                <td className="border-full">
                  <div className="d-flex flex-column">
                    <span className="fw-bold" style={{ fontSize: '9pt' }}>
                      Master carton packaging passes 90 cm drop test: YES
                    </span>
                    <span style={{ fontSize: '9pt' }}>
                      Master carton packaging passes others:_ _ _ _ _ _ _ _ _ _
                      _<strong>YES</strong>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Form>
  );
});
