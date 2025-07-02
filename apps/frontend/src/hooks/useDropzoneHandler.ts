import { DROPZONE_DEFAULT_OPTION } from '@/config/dropzone';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface DropzoneHandler {
  selectedFiles?: (files: File[]) => void;
  options?: DropzoneOptions;
}

const useDropzoneHandler = ({ selectedFiles, options }: DropzoneHandler) => {
  const dropzone = useDropzone({
    onDrop: (acceptedFiles, fileRejections) => {
      selectedFiles?.(acceptedFiles);

      if (fileRejections.length > 0) {
        const error = fileRejections[0].errors[0];
        const description = error.code.includes('file-too-large')
          ? 'File is larger than 10MB'
          : error.message;
        toast.error(error.code, { description });
      }
    },
    ...options,
    ...DROPZONE_DEFAULT_OPTION,
  });

  return dropzone;
};

export default useDropzoneHandler;
