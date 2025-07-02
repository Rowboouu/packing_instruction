import { Icons } from '@/components/icons';
import { LoadingContent } from '@/components/loader/loading-content';
import { Button } from '@/components/ui/button';
import {
  Assortment,
  getAssortmentQuery,
  useGetAssortment,
} from '@/features/assortments';
import { PreviewPDFContainer } from '@/features/pcf-images';
import useGetInitialData from '@/hooks/useGetInititalData';
import { useModalStore } from '@/lib/store/modalStore';
import React from 'react';
import { useAttachmentStore } from '..';

interface AttachmentCardProps {
  item: Assortment;
}

export function AttachmentCard({ item }: AttachmentCardProps) {
  const { setModal } = useModalStore();
  const { removeItem, addItemSize } = useAttachmentStore();

  const assortmentId = item._id;
  const query = getAssortmentQuery(assortmentId);
  const initialData = useGetInitialData(query);
  const { data: assortment } = useGetAssortment(assortmentId, {
    initialData,
  });

  const defaultSize = 32768;

  const sizeInBytes = assortment?.pcfImages.reduce((acc, curr) => {
    return acc + curr.fileData.size;
  }, defaultSize);

  const fileSizeInKB = (sizeInBytes ?? defaultSize) / 1024;
  const fileSizeInMB = fileSizeInKB / 1024;

  React.useEffect(() => {
    addItemSize({ itemId: item._id, size: 10 });
  }, [fileSizeInMB]);

  return (
    <div className="btn col-auto border p-0 rounded position-relative me-2">
      <div
        className="d-flex align-items-center py-2"
        onClick={handleAttachmentPreview}
      >
        <div className="btn-icon rounded-3 text-400">
          <Icons.FileAlt />
        </div>
        <div>
          <h6 className="text-1000 pdf-file-name m-0 mb-1">
            {item.customerItemNo} Package Confirmation Form.pdf
          </h6>
          <p
            className="fs--0 mb-0 text-700 lh-1"
            style={{
              textAlign: 'start',
            }}
          >
            {fileSizeInMB.toFixed(2)} MB
          </p>
        </div>
      </div>
      <div className="position-absolute top-0 end-0 p-1">
        <Button
          size="icon"
          variant="phoenix-danger"
          style={{
            height: '20px',
            width: '20px',
          }}
          onClick={handleRemoveAttachment}
        >
          <Icons.X />
        </Button>
      </div>
    </div>
  );

  function handleAttachmentPreview() {
    setModal({
      component: {
        title: item.customerItemNo + ' Package Confirmation Form.pdf',
        body: <AttachmentCardModalBody item={item} />,
      },
      option: {
        size: 'xl',
      },
    });
  }

  function handleRemoveAttachment() {
    removeItem(item);
  }
}

function AttachmentCardModalBody({ item }: AttachmentCardProps) {
  const assortmentId = item._id;
  const query = getAssortmentQuery(assortmentId);
  const initialData = useGetInitialData(query);
  const { data: assortment, isLoading } = useGetAssortment(assortmentId, {
    initialData,
  });

  if (isLoading) {
    return <LoadingContent />;
  }

  if (!assortment) {
    return <></>;
  }

  return (
    <div
      className="d-flex justify-content-center overflow-auto scrollbar"
      style={{ height: '80vh' }}
    >
      <div>
        <PreviewPDFContainer assortment={assortment} />;
      </div>
    </div>
  );
}
