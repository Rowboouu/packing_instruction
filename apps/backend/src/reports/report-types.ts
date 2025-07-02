import { FileObject } from 'src/zulu-assortments/uploadObject';

export type ImageDimension = { width: number; height: number };

export type ExcelReportImageDimension = Record<
  keyof Partial<FileObject>,
  ImageDimension
>;
