import React from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { FieldError } from 'react-hook-form';

import { ConditionalShell } from '@/components/conditional-shell';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileDropzoneProps {
  onChange?: (file?: File) => void;
  value?: File | null;
  disabled?: boolean;
  error?: FieldError;
}

export function FileDropzone({
  onChange,
  value,
  disabled,
  error,
}: FileDropzoneProps) {
  const onDrop = React.useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (acceptedFiles.length > 0) {
        onChange && onChange(acceptedFiles[0]);
      }

      if (fileRejections.length > 0) {
        onChange && onChange(undefined);
        const error = fileRejections[0].errors[0];
        const description = error.code.includes('file-too-large')
          ? 'File is larger than 10MB'
          : error.message;
        toast.error(error.code, { description });
      }
    },
    [onChange],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/vnd.*': ['.xlsx', '.xls', '.csv'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB limit
    disabled,
  });

  const borderClass = () => {
    if (isDragActive && isDragAccept) {
      return 'border-success';
    } else if (isDragActive && isDragReject) {
      return 'border-danger';
    } else {
      return '';
    }
  };
  const borderColor = borderClass();

  return (
    <>
      <div {...getRootProps({ className: 'dropzone p-0' })}>
        <div
          className={cn(
            'dz-container border',
            error && 'border-danger',
            borderColor,
          )}
        >
          <input {...getInputProps()} />
          <div className="d-flex flex-column text-center align-items-center">
            <span className="fs--1 fw-bold text-uppercase">
              Upload customer form template
            </span>
            <Icons.UAddFile width={24} height={24} />
          </div>
        </div>
      </div>
      <ConditionalShell condition={Boolean(value)}>
        <div className="dz-preview dz-preview-multiple m-0 d-flex flex-column mt-2">
          <div className="d-flex pb-3 border-bottom media px-2">
            <div className="flex-1 d-flex flex-between-center">
              <div>
                <h6 data-dz-name="data-dz-name">{value?.name}</h6>
              </div>
              <button
                className="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal dropdown-caret-none"
                type="button"
                onClick={() => {
                  if (onChange) {
                    onChange(undefined);
                  }
                }}
              >
                x
              </button>
            </div>
          </div>
        </div>
      </ConditionalShell>
    </>
  );
}
