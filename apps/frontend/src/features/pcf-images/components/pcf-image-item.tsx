import { Dropdown } from 'react-bootstrap';

import { ConditionalShell } from '@/components/conditional-shell';
import { PCFImgDropdownToggle } from '@/components/custom-dropdown';
import { Icons } from '@/components/icons';
import useGETPCFImageState from '@/hooks/useGetPCFImageState';
import { useTranslation } from 'react-i18next';
import {
  ImageDeleteButton,
  ImagePreviewCard,
  ImageRetakeButton,
  PcfImage,
} from '..';

interface PCFImageItemProps {
  assortmentId?: string;
  item: File | PcfImage;
  label?: string;
  onOpenClick?: () => void;
  onDeleteClick?: (item: File | PcfImage) => void;
}

export function PCFImageItem({
  assortmentId,
  item,
  label,
  onOpenClick,
  onDeleteClick,
}: PCFImageItemProps) {
  const { t } = useTranslation();

  const { canRetake, isRetake, isBarcodeError } = useGETPCFImageState(item);

  return (
    <>
      <ConditionalShell condition={Boolean(isBarcodeError || isRetake)}>
        {isBarcodeError ? (
          <div
            className="pcf-image-barcode-error"
            style={{ backgroundColor: 'rgba(255, 165, 0, 0.5)' }}
          >
            <h1>{t(`keyText_barcodeError`)}</h1>
          </div>
        ) : (
          isRetake && (
            <div
              className="pcf-image-retake"
              style={{
                pointerEvents: 'none',
                backgroundColor: 'rgba(255, 0, 83, 0.3)',
              }}
            >
              <h1>{t(`keyText_retake`)}</h1>
            </div>
          )
        )}
      </ConditionalShell>
      <Dropdown className="position-absolute top-0 end-0 p-1">
        <Dropdown.Toggle as={PCFImgDropdownToggle}>
          <Icons.EllipsisVertical height={14} width={14} />
        </Dropdown.Toggle>

        <Dropdown.Menu className="py-2">
          <ConditionalShell condition={canRetake}>
            <Dropdown.Item
              as={ImageRetakeButton}
              assortmentId={assortmentId ?? ''}
              item={item}
            />
          </ConditionalShell>
          <ConditionalShell
            condition={Boolean(onDeleteClick) && Boolean(onOpenClick)}
          >
            <Dropdown.Item href="#" onClick={onOpenClick}>
              <Icons.Edit height={14} width={14} />
              <span className="ms-2 fs-0">{t(`keyButton_replace`)}</span>
            </Dropdown.Item>
          </ConditionalShell>
          <Dropdown.Item
            as={ImageDeleteButton}
            onDeleteClick={onDeleteClick}
            assortmentId={assortmentId ?? ''}
            item={item}
          />
        </Dropdown.Menu>
      </Dropdown>

      <ImagePreviewCard item={item} alt={label ?? 'Image preview'} />
    </>
  );
}
