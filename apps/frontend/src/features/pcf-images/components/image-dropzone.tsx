import { Ref, forwardRef } from 'react';

import { Icons } from '@/components/icons';
import { Card, CardFooter } from '@/components/ui/card';
import useDropzoneHandler from '@/hooks/useDropzoneHandler';
import { groupPCFImages } from '@/utils/pcf-util';
import { useTranslation } from 'react-i18next';
import { PCFImageItem } from './pcf-image-item';

interface ImageDropZoneProps {
  assortmentId?: string;
  name?: string;
  label?: string;
  value?: File;
  onChange?: (file?: File) => void;
  groupPcfImages?: ReturnType<typeof groupPCFImages>;
}

export const ImageDropZone = forwardRef<HTMLDivElement, ImageDropZoneProps>(
  (
    { assortmentId, label, name, value, groupPcfImages, onChange },
    ref: Ref<HTMLDivElement>,
  ) => {
    const { t } = useTranslation();
    const pcfImage = name
      ? groupPcfImages?.[name as keyof typeof groupPcfImages]?.[0]
      : undefined;
    const item = value || pcfImage;

    const { getRootProps, getInputProps, open } = useDropzoneHandler({
      selectedFiles: (files) => onChange?.(files[0]),
      options: { multiple: false },
    });

    function handleOnDelete() {
      if (item && typeof item === 'object' && item instanceof File) {
        onChange?.(undefined);
      }
    }

    return (
      <Card 
        ref={ref} 
        style={{ height: '200px', width: '220px' }} 
        className="pcf-card"
      >
        {item ? (
          <PCFImageItem
            item={item}
            label={label}
            assortmentId={assortmentId}
            onOpenClick={open}
            onDeleteClick={handleOnDelete}
          />
        ) : (
          <div
            {...getRootProps({
              className: 'h-full w-full flex items-center',
            })}
          >
            <input {...getInputProps()} />

            <div className="h-full w-full flex justify-center items-center">
              <Icons.Plus height={14} width={14} />
              <span className="ml-2 text-sm">{t(`keyText_newImage`)}</span>
            </div>
          </div>
        )}
        <CardFooter className="p-0 flex flex-col text-center text-gray-600">
          <span className="text-sm truncate">{label}</span>
        </CardFooter>
      </Card>
    );
  },
);
