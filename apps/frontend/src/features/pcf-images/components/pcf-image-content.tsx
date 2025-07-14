import React, { forwardRef } from 'react';
import { PcfImage } from '..';

interface PCFImageContentProps extends React.HTMLAttributes<HTMLImageElement> {
  pcfImage?: PcfImage | any; // ✅ Allow any type for flexibility
  height?: number | string;
  maxWidth?: number | string;
}

export const PCFImageContent = forwardRef<
  HTMLImageElement,
  PCFImageContentProps
>(({ pcfImage, height, maxWidth, ...props }, ref) => {
  if (!pcfImage) {
    console.log('❌ PCFImageContent: No pcfImage provided');
    return null;
  }

  console.log('🔍 PCFImageContent: Processing image:', pcfImage);

  // ✅ ENHANCED: Smart image source detection for different data structures
  const getImageSrc = (image: any): string => {
    // Case 1: Direct base64 data (Odoo webhook images)
    if (image.image && typeof image.image === 'string') {
      if (image.image.startsWith('data:')) {
        return image.image; // Already a data URL
      } else if (image.image.startsWith('/webhook/')) {
        return image.image; // User upload path
      } else {
        // ✅ ENHANCED: Process raw base64 from Odoo with proper handling
        return processBase64Image(image.image);
      }
    }

    // Case 2: Standard PCF image structure
    if (image.fileData?.filename) {
      return `/api/files/static/${image.fileData.filename}`;
    }

    // Case 3: User uploaded files with filename
    if (image.filename) {
      // Check if it's a user upload path
      if (image.filename.startsWith('/webhook/')) {
        return image.filename;
      } else {
        return `/webhook/pcf-images/${image.filename}`;
      }
    }

    // Case 4: Direct filename property
    if (typeof image === 'string') {
      if (image.startsWith('data:') || image.startsWith('/')) {
        return image;
      } else {
        return `/api/files/static/${image}`;
      }
    }

    // Case 5: Check for other common properties
    if (image.src) {
      return image.src;
    }

    if (image.url) {
      return image.url;
    }

    console.warn('⚠️ PCFImageContent: Could not determine image source for:', image);
    return ''; // Return empty string as fallback
  };

  // ✅ NEW: Base64 processing with double encoding detection and MIME type identification
  const processBase64Image = (base64Data: string): string => {
    try {
      let processedData = base64Data;
      
      // Step 1: Check for double encoding
      if (isDoubleEncoded(base64Data)) {
        console.log('🔍 Detected double-encoded base64, decoding...');
        processedData = decodeBase64(base64Data);
      }
      
      // Step 2: Identify image type
      const mimeType = detectImageMimeType(processedData);
      console.log('🔍 Detected MIME type:', mimeType);
      
      // Step 3: Create proper data URL
      return `data:${mimeType};base64,${processedData}`;
      
    } catch (error) {
      console.error('❌ Error processing base64 image:', error);
      return `data:image/png;base64,${base64Data}`; // Fallback
    }
  };

  // ✅ NEW: Detect if base64 is double-encoded
  const isDoubleEncoded = (data: string): boolean => {
    try {
      // Double-encoded base64 will decode to another valid base64 string
      const decoded = atob(data);
      
      // Check if decoded result looks like base64 (starts with common image signatures)
      const imageSignatures = [
        'iVBORw0KGgo', // PNG
        '/9j/', // JPEG
        'R0lGODlh', // GIF
        'UklGR', // WebP
        'Qk0' // BMP
      ];
      
      return imageSignatures.some(sig => decoded.startsWith(sig));
    } catch (e) {
      return false;
    }
  };

  // ✅ NEW: Decode base64 string
  const decodeBase64 = (data: string): string => {
    try {
      return atob(data);
    } catch (error) {
      console.error('❌ Failed to decode base64:', error);
      return data; // Return original if decode fails
    }
  };

  // ✅ NEW: Detect image MIME type from base64 data
  const detectImageMimeType = (base64Data: string): string => {
    // Remove any whitespace and get first few characters
    const cleanData = base64Data.replace(/\s/g, '');
    const header = cleanData.substring(0, 20);
    
    // PNG signature: iVBORw0KGgo
    if (header.startsWith('iVBORw0KGgo')) {
      return 'image/png';
    }
    
    // JPEG signature: /9j/
    if (header.startsWith('/9j/')) {
      return 'image/jpeg';
    }
    
    // GIF signature: R0lGODlh (GIF87a) or R0lGODdh (GIF89a)
    if (header.startsWith('R0lGODlh') || header.startsWith('R0lGODdh')) {
      return 'image/gif';
    }
    
    // WebP signature: UklGR
    if (header.startsWith('UklGR')) {
      return 'image/webp';
    }
    
    // BMP signature: Qk0
    if (header.startsWith('Qk0')) {
      return 'image/bmp';
    }
    
    // SVG signature (less common in base64): PHN2Zw (starts with <svg)
    if (header.startsWith('PHN2Zw')) {
      return 'image/svg+xml';
    }
    
    // TIFF signatures: SUkq (little-endian) or TU0q (big-endian)
    if (header.startsWith('SUkq') || header.startsWith('TU0q')) {
      return 'image/tiff';
    }
    
    // ICO signature: AAABAAEAEBAAAAEAIABoBAAAFgAAA
    if (header.includes('AAABAAEAD') || header.includes('AAABAAEAD')) {
      return 'image/x-icon';
    }
    
    console.warn('⚠️ Unknown image format, defaulting to PNG. Header:', header);
    return 'image/png'; // Default fallback
  };

  // ✅ ENHANCED: Smart alt text generation
  const getAltText = (image: any): string => {
    return image.componentName || 
           image.field || 
           image.label || 
           image.originalname || 
           image.filename || 
           'PCF Image';
  };

  const src = getImageSrc(pcfImage);
  const altText = getAltText(pcfImage);

  console.log('🔍 PCFImageContent: Using src:', src);

  // Don't render if we couldn't determine a source
  if (!src) {
    console.error('❌ PCFImageContent: No valid image source found');
    return (
      <div 
        style={{
          height: `${height}px`,
          width: 'auto',
          maxWidth,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          border: '2px dashed #d1d5db',
          color: '#6b7280'
        }}
      >
        No Image
      </div>
    );
  }

  return (
    <img
      ref={ref}
      {...props}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: 'auto',
        maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
        objectFit: 'contain',
        ...props.style, // Allow style overrides
      }}
      src={src}
      alt={altText}
      onError={(e) => {
        console.error('🚨 PCFImageContent: Image failed to load:', {
          src,
          pcfImage,
          error: e
        });
        // Set a placeholder on error
        const target = e.target as HTMLImageElement;
        target.style.backgroundColor = '#fee2e2';
        target.style.border = '2px dashed #fca5a5';
        target.alt = 'Failed to load image';
      }}
      onLoad={() => {
        console.log('✅ PCFImageContent: Image loaded successfully:', src);
      }}
    />
  );
});