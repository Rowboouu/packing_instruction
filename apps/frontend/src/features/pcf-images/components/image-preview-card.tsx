import { useModalStore } from '@/lib/store/modalStore';
import { getPCFImageSrc } from '@/utils/pcf-util';
import { PcfImage } from '..';

interface Props {
  item: File | PcfImage;
  alt?: string;
}

export function ImagePreviewCard({ item, alt }: Props) {
  const { setModal } = useModalStore();
  const imgSrc = getPCFImageSrc(item);

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
      />
    </div>
  );
}
