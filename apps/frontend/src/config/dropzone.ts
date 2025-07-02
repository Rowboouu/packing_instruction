import { DropzoneOptions } from 'react-dropzone';

export const DROPZONE_MAXSIZE = 10 * 1024 * 1024;
export const DROPZONE_DEFAULT_OPTION: DropzoneOptions = {
  accept: {
    'image/*': ['.png', '.jpg', '.jpeg'],
  },
  maxSize: DROPZONE_MAXSIZE,
};
