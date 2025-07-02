export const imageUploadField = [
  { name: 'masterUccLabel', maxCount: 1 },
  { name: 'masterShippingMark', maxCount: 1 },
  { name: 'masterCarton', maxCount: 1 },
  { name: 'innerItemLabel', maxCount: 1 },
  { name: 'innerUccLabel', maxCount: 1 },
  { name: 'innerItemUccLabel', maxCount: 1 },
  { name: 'innerCarton', maxCount: 1 },
  { name: 'upcLabelFront', maxCount: 1 },
  { name: 'upcLabelBack', maxCount: 1 },
  { name: 'upcPlacement' },
  { name: 'productPictures' },
  { name: 'protectivePackaging' },
];

export type FileObject = {
  masterUccLabel?: Express.Multer.File[];
  masterShippingMark?: Express.Multer.File[];
  masterCarton?: Express.Multer.File[];
  innerItemLabel?: Express.Multer.File[];
  innerUccLabel?: Express.Multer.File[];
  innerItemUccLabel?: Express.Multer.File[];
  innerCarton?: Express.Multer.File[];
  upcLabelFront?: Express.Multer.File[];
  upcLabelBack?: Express.Multer.File[];
  upcPlacement?: Express.Multer.File[];
  productPictures?: Express.Multer.File[];
  protectivePackaging?: Express.Multer.File[];
};
