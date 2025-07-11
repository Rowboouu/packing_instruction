import { Card, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useSaveIndividualAssortment } from '../api/saveIndividualAssortment';
import { useState } from 'react';

interface PackingInstructionCardProps {
  assortment: {
    _id: string;
    customerItemNo?: string;
    itemNo: string;
    status: string;
    name: string;
    image?: string; // 🆕 Final assembled product image (base64)
    webhookImageCount: number;
    dimensions: {
      length_cm: number;
      width_cm: number;
      height_cm: number;
    };
    // Component images (fallback)
    webhookImages?: {
      itemPackImages?: any[][];
      itemBarcodeImages?: any[];
      displayImages?: any[];
      innerCartonImages?: any[];
      masterCartonImages?: any[];
    };
    pcfImages?: any; // Fallback for different data structure
  };
  salesOrderId: string;
}

// Enhanced base64 signature detection (same as before)
const analyzeBase64Signature = (base64Data: string): string => {
  if (!base64Data) return 'png';
  
  try {
    const first20 = base64Data.substring(0, 20);
    const decoded = atob(first20);
    const binaryBytes = Array.from(decoded, c => c.charCodeAt(0));
    
    if (binaryBytes.length >= 4) {
      const sig = binaryBytes.slice(0, 4);
      
      if (sig[0] === 0x89 && sig[1] === 0x50 && sig[2] === 0x4E && sig[3] === 0x47) {
        return 'png';
      } else if (sig[0] === 0xFF && sig[1] === 0xD8) {
        return 'jpeg';
      } else if (decoded.startsWith('GIF')) {
        return 'gif';
      }
    }
  } catch (error) {
    console.warn('Failed to analyze image signature, defaulting to PNG');
  }
  
  return 'png';
};

const fixBase64ImageSrc = (base64Data: string): string => {
  if (!base64Data) return '';
  
  if (base64Data.startsWith('data:image/')) {
    return base64Data;
  }
  
  const mimeType = analyzeBase64Signature(base64Data);
  return `data:image/${mimeType};base64,${base64Data}`;
};

// Get first available image from webhook data
const getFirstAvailableImage = (assortment: PackingInstructionCardProps['assortment']): string | null => {
  // Debug what data we actually have
  console.log(`🔍 Checking images for ${assortment.itemNo}:`, {
    "assortment.image": assortment.image,
  });
  
  const image = assortment.image;
  
  if (!image) {
    console.log(`❌ No image data found for ${assortment.itemNo}`);
    return null;
  }
  return fixBase64ImageSrc(image);
};

// Create a simple SVG placeholder instead of relying on external image
const createPlaceholderDataURL = (itemNo: string): string => {
  const svg = `
    <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="50" y="40" width="100" height="70" fill="#e5e7eb" rx="8"/>
      <circle cx="75" cy="65" r="8" fill="#d1d5db"/>
      <polygon points="85,85 110,60 125,75 135,65 145,75 145,95 85,95" fill="#d1d5db"/>
      <text x="100" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">
        ${itemNo}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export function PackingInstructionCard({ assortment, salesOrderId }: PackingInstructionCardProps) {
  const navigate = useNavigate();
  const { mutate: saveForStandalone } = useSaveIndividualAssortment({
    showToast: false, // Silent background save
  });
  
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Get the first available image
  const firstImage = getFirstAvailableImage(assortment);
  
  // Use SVG placeholder instead of external image
  const placeholderSrc = createPlaceholderDataURL(assortment.itemNo);
  const imageSrc = imageError ? placeholderSrc : (firstImage || placeholderSrc);
  
  const handleClick = async () => {
    console.log(`🔄 Navigating to assortment: ${assortment.itemNo}`);
    
    // Save individual assortment in background for future standalone access
    try {
      saveForStandalone({
        assortment: assortment,
        sourceOrderName: salesOrderId,
      });
      console.log(`💾 Started background save for individual assortment data`);
    } catch (error) {
      console.error(`❌ Error saving individual assortment data:`, error);
      // Don't block navigation if saving fails
    }

    // Navigate immediately with assortment data in state for fast access
    navigate(`/packing-instruction/${assortment.itemNo}`, {
      state: { 
        assortmentData: assortment,
        sourceOrder: { id: salesOrderId },
        fromTable: true 
      }
    });
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    if (firstImage) {
      console.log(`✅ Successfully loaded image for ${assortment.itemNo}`);
    }
  };

  const handleImageError = () => {
    // Only log error if we were trying to load an actual image (not already using placeholder)
    if (firstImage && !imageError) {
      console.warn(`❌ Failed to load webhook image for ${assortment.itemNo}, using placeholder`);
    }
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <Card className="p-2 hover:shadow-lg transition-transform duration-200 hover:scale-105">
        <div className="relative">
          {/* Enhanced image with proper base64 handling */}
          <div className="relative w-full h-40 flex items-center justify-center bg-gray-50 rounded-md overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            <img
              src={imageSrc}
              alt={assortment.itemNo}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
            />
            
            {/* Debug indicator for webhook images */}
            {firstImage && !imageError && (
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                  ODOO IMG
                </span>
              </div>
            )}
            
            {/* Placeholder indicator */}
            {(!firstImage || imageError) && (
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500 text-white">
                  NO IMG
                </span>
              </div>
            )}
          </div>
          
          {/* Image count badge */}
          {assortment.status && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {assortment.status}
              </span>
            </div>
          )}
        </div>
        
        <CardFooter className="p-2 h-[110px] overflow-y-auto text-center text-gray-600 mt-3">
          <span className="text-sm font-bold text-blue-600 mb-1">
            {assortment.customerItemNo} | {assortment.itemNo}
          </span>
          <span 
            className="text-sm text-gray-700 line-clamp-2 hover:line-clamp-none transition-all duration-200" 
            title={assortment.name}
          >
            {assortment.name}
          </span>
          
          {/* Dimensions info */}
          <div className="text-xs text-gray-500 mt-2">
            {assortment.dimensions.length_cm} × {assortment.dimensions.width_cm} × {assortment.dimensions.height_cm} cm
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}