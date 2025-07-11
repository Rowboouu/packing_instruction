import { Dropdown } from 'react-bootstrap';
import { ConditionalShell } from '@/components/conditional-shell';
import { PCFImgDropdownToggle } from '@/components/custom-dropdown';
import { Icons } from '@/components/icons';
import useGETPCFImageState from '@/hooks/useGetPCFImageState';
import { useTranslation } from 'react-i18next';
import { ImageDeleteButton, ImagePreviewCard, PcfImage } from '..';

interface PCFImageItemProps {
  assortmentId?: string;
  item: File | PcfImage;
  label?: string;
  onOpenClick?: () => void;
  onDeleteClick?: (item: File | PcfImage) => void;
  onStageForDelete?: (filename: string) => void;
  base64Data?: string;
  hideOptions?: boolean;
}

export function PCFImageItem({
  item,
  label,
  onOpenClick,
  onStageForDelete,
  base64Data,
  hideOptions = false,
}: PCFImageItemProps) {
  const { t } = useTranslation();
  const { isRetake, isBarcodeError } = useGETPCFImageState(item);
  const showRetakeOverlay = isBarcodeError || isRetake;

  return (
    <>
      <ConditionalShell condition={showRetakeOverlay && !base64Data}>
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
      {!hideOptions && (
        <Dropdown className="position-absolute top-0 end-0 p-1">
          <Dropdown.Toggle as={PCFImgDropdownToggle}>
            <Icons.EllipsisVertical height={14} width={14} />
          </Dropdown.Toggle>

          <Dropdown.Menu className="py-2">
            <ConditionalShell condition={Boolean(onOpenClick)}>
              <Dropdown.Item href="#" onClick={onOpenClick}>
                <Icons.Edit height={14} width={14} />
                <span className="ms-2 fs-0">{t(`keyButton_replace`)}</span>
              </Dropdown.Item>
            </ConditionalShell>
            <ConditionalShell condition={Boolean(onStageForDelete)}>
              <Dropdown.Item
                as={ImageDeleteButton}
                item={item}
                onStageForDelete={onStageForDelete!}
              />
            </ConditionalShell>
          </Dropdown.Menu>
        </Dropdown>
      )}

      {hideOptions && (
        <div 
          className="position-absolute top-0 start-0 p-1" 
          title="System image - options not available"
        >
          <div 
            className="badge bg-primary text-white d-flex align-items-center"
            style={{ fontSize: '0.7rem' }}
          >
            <Icons.MaSettings height={10} width={10} className="me-1" />
            System
          </div>
        </div>
      )}
  
      <ImagePreviewCard 
        item={item} 
        alt={label ?? 'Image preview'} 
        base64Data={base64Data}
      />
    </>
  );
}