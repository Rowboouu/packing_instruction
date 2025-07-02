import React, { forwardRef } from 'react';
import { PcfImage } from '..';

interface PCFImageContentProps extends React.HTMLAttributes<HTMLImageElement> {
  pcfImage?: PcfImage;
  height?: number | string;
  maxWidth?: number | string;
}

export const PCFImageContent = forwardRef<
  HTMLImageElement,
  PCFImageContentProps
>(({ pcfImage, height, maxWidth, ...props }, ref) => {
  if (!pcfImage) return null;

  const src = `/api/files/static/${pcfImage.fileData.filename}`;

  return (
    <img
      ref={ref}
      {...props}
      style={{
        height: `${height}px`,
        width: 'auto',
        maxWidth,
        objectFit: 'contain',
      }}
      src={src}
      alt={pcfImage.field}
    />
  );
});
