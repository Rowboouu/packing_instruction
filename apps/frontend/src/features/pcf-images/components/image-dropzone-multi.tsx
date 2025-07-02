import { Ref, forwardRef } from 'react';

import { Icons } from '@/components/icons';
import { Card, CardFooter } from '@/components/ui/card';
import useDropzoneHandler from '@/hooks/useDropzoneHandler';
import { groupPCFImages } from '@/utils/pcf-util';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PcfImage } from '..';
import { PCFImageItem } from './pcf-image-item';

interface ImageDropZoneMultiProps {
  assortmentId?: string;
  name?: string;
  value?: File[];
  onChange?: (files?: File[]) => void;
  groupPcfImages?: ReturnType<typeof groupPCFImages>;
}

export const ImageDropZoneMulti = forwardRef<
  HTMLDivElement,
  ImageDropZoneMultiProps
>(
  (
    { assortmentId, name, value, groupPcfImages, onChange },
    ref: Ref<HTMLDivElement>,
  ) => {
    const { t } = useTranslation();
    const [items, setItems] = React.useState<(File | PcfImage)[]>(value || []);

    const pcfImages = name
      ? groupPcfImages?.[name as keyof typeof groupPcfImages]
      : [];

    const initialItems = value || [];

    React.useEffect(() => {
      setItems([...(pcfImages || []), ...initialItems]);
    }, [pcfImages, value]);

    const { getRootProps, getInputProps } = useDropzoneHandler({
      selectedFiles: (files) => onChange?.([...initialItems, ...(files || [])]),
    });

    function handleOnDelete(item: File | PcfImage) {
      if (item instanceof File) {
        const newItems = value?.filter((i) => i !== item);
        onChange?.(newItems);
      }
    }

    return (
      <div ref={ref} className="border-top pt-2 assortments-images-container">
        {items?.map((item, idx) => {
          return (
            <Card style={{ minHeight: '200px' }} key={idx}>
              <PCFImageItem
                item={item}
                label={`Image ${idx + 1}`}
                assortmentId={assortmentId}
                onDeleteClick={handleOnDelete}
              />

              <CardFooter className="p-0 d-flex flex-column text-center text-secondary">
                <span className="fs--1 text-limit">Image {idx + 1}</span>
              </CardFooter>
            </Card>
          );
        })}

        <Card
          style={{ minHeight: '200px' }}
          {...getRootProps({
            className: 'border-dashed',
          })}
        >
          <input {...getInputProps()} />
          <div className="h-100 w-100 d-flex justify-content-center align-items-center">
            <Icons.Plus height={14} width={14} />
            <span className="ms-2 fs-0">{t(`keyText_newImage`)}</span>
          </div>
        </Card>
      </div>
    );
  },
);
