import { useModalStore } from '@/lib/store/modalStore';
import { getPCFImageSrc } from '@/utils/pcf-util';
import { PcfImage } from '..';

interface Props {
  item: File | PcfImage;
  alt?: string;
  base64Data?: string; // Add this prop for Odoo base64 images
}

export function ImagePreviewCard({ item, alt, base64Data }: Props) {
  const { setModal } = useModalStore();
  
  const imgSrc = getPCFImageSrc(item, base64Data);

  function handleImageClick() {
    setModal({
      component: {
        title: alt ?? 'Image preview',
        body: <ImagePreview src={imgSrc} alt={alt ?? 'Image preview'} />,
      },
      option: {
        size: 'xl',
      },
    });
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className="lazy"
      onClick={handleImageClick}
      style={{
        maxWidth: '100%',
        height: 'auto',
        maxHeight: '180px',
        display: 'block',
        margin: 'auto',
        objectFit: 'contain',
      }}
      onError={(e) => {
        // Enhanced error handling with more details
        console.error('🚨 Image failed to load:', {
          src: imgSrc,
          originalBase64Start: base64Data?.substring(0, 30),
          hasBase64: !!base64Data
        });
        const target = e.target as HTMLImageElement;
        target.style.backgroundColor = '#f3f4f6';
        target.style.border = '2px dashed #d1d5db';
        target.alt = 'Image failed to load';
      }}
    />
  );
}

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="d-flex justify-content-center"
      style={{
        height: '80vh',
      }}
    >
      <img
        src={src}
        alt={alt}
        className="lazy"
        style={{
          maxWidth: '100%',
          height: 'auto',
          maxHeight: '80vh',
          display: 'block',
          objectFit: 'contain',
        }}
        onError={(e) => {
          console.error('🚨 Modal image failed to load:', src);
          const target = e.target as HTMLImageElement;
          target.style.backgroundColor = '#f3f4f6';
          target.style.border = '2px dashed #d1d5db';
          target.alt = 'Image failed to load';
        }}
      />
    </div>
  );
}