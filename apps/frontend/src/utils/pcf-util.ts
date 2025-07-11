import { UploadImageDTO } from '@/features/assortments';
import { PcfImage } from '@/features/pcf-images';

export function groupPCFImages(images: PcfImage[]) {
  return images.reduce(
    (acc, curr) => {
      const field = curr.field as keyof UploadImageDTO;
      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push(curr);
      return acc;
    },
    {} as Record<keyof UploadImageDTO, PcfImage[]>,
  );
}

// Helper function to detect if base64 is double-encoded and decode it
function decodeBase64IfNeeded(base64Data: string): string {
  try {
    // Check if this looks like your double-encoded format
    if (base64Data.startsWith('aVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQU9R') || 
        base64Data.match(/^[A-Za-z0-9+/]{40,}={0,2}$/)) {
      
      // Try to decode once to see if we get a proper image format
      const firstDecode = atob(base64Data);
      
      // Check if the decoded result looks like a standard image base64
      if (firstDecode.startsWith('iVBORw0KGgo') || // PNG
          firstDecode.startsWith('/9j/4AAQSkZJRgAB') || // JPEG
          firstDecode.startsWith('R0lGODlh') || // GIF
          firstDecode.startsWith('UklGR')) { // WebP
        
        return firstDecode; // Return the decoded version
      }
    }
    
    // If not double-encoded, return as-is
    return base64Data;
  } catch (e) {
    console.warn('Failed to decode base64:', e);
    return base64Data; // Return original if decode fails
  }
}

// Helper function to detect image type from base64 signature - ENHANCED
function detectImageTypeFromBase64(base64Data: string): string {
  try {
    // First decode if needed
    const decodedBase64 = decodeBase64IfNeeded(base64Data);
    const cleanBase64 = decodedBase64.replace(/^data:image\/[^;]+;base64,/, '');
    
    // Check for standard base64 image patterns
    if (cleanBase64.startsWith('iVBORw0KGgo')) {
      return 'png';
    }
    if (cleanBase64.startsWith('/9j/4AAQSkZJRgAB')) {
      return 'jpeg';
    }
    if (cleanBase64.startsWith('R0lGODlh')) {
      return 'gif';
    }
    if (cleanBase64.startsWith('UklGR')) {
      return 'webp';
    }
    
    // If pattern matching fails, decode and check binary signature
    const first20 = cleanBase64.substring(0, 20);
    const decoded = atob(first20);
    const binaryBytes = Array.from(decoded, c => c.charCodeAt(0));
    
    if (binaryBytes.length >= 4) {
      const sig = binaryBytes.slice(0, 4);
      if (sig[0] === 0x89 && sig[1] === 0x50 && sig[2] === 0x4E && sig[3] === 0x47) return 'png';
      if (sig[0] === 0xFF && sig[1] === 0xD8) return 'jpeg';
      if (decoded.startsWith('GIF')) return 'gif';
      if (decoded.startsWith('RIFF') && decoded.includes('WEBP')) return 'webp';
    }
    
  } catch (e) {
    console.warn('Failed to detect image type from base64:', e);
  }
  return 'png'; // default fallback
}

// FIXED: Enhanced function with base64 decoding and detailed logging
export function getPCFImageSrc(item: File | PcfImage, base64Data?: string) {

  // If base64Data is provided (for Odoo images), use it directly
  if (base64Data) {
    
    // Check if it's already a data URL
    if (base64Data.startsWith('data:')) {
      return base64Data;
    }
    // Check if it's a webhook endpoint URL
    if (base64Data.startsWith('/webhook/pcf-images/')) {
      return base64Data;
    }
    // FIXED: For raw base64, decode if needed and create proper data URL
    if (typeof base64Data === 'string' && base64Data.length > 100) {
      
      // Decode the base64 if it's double-encoded
      const properBase64 = decodeBase64IfNeeded(base64Data);
      const imageType = detectImageTypeFromBase64(properBase64);
      
      
      // Return standard data URL with properly decoded base64
      const finalUrl = `data:image/${imageType};base64,${properBase64}`;
      return finalUrl;
    }
  }

  // Handle File objects
  if (typeof item === 'object' && item instanceof File) {
    return URL.createObjectURL(item);
  }

  // Handle PcfImage objects
  const pcfImage = item as PcfImage;
  
  // Check if it's a user-uploaded image (should use webhook endpoint)
  if (pcfImage.field === 'user-upload' && pcfImage.filename) {
    return `/webhook/pcf-images/${pcfImage.filename}`;
  }

  // Default fallback to traditional file serving
  const imgSrc = `/api/files/static/${pcfImage.fileData.filename}`;
  return imgSrc;
}