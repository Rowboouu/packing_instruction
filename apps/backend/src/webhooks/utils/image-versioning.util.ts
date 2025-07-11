// src/utils/image-versioning.util.ts
import * as crypto from 'crypto';

export interface ImageHashResult {
  hash: string;
  size: number;
  mimeType: string;
}

export interface ImageCollectionHashResult {
  collectionHash: string;
  totalImages: number;
  individualHashes: Record<string, string>;
  changedImages?: string[];
}

export class ImageVersioningUtil {
  /**
   * Generate SHA-256 hash for a base64 image
   */
  static hashBase64Image(base64Image: string): ImageHashResult {
    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/[^;]+;base64,/, '');
    
    // Calculate hash
    const hash = crypto.createHash('sha256').update(base64Data, 'base64').digest('hex');
    
    // Calculate size in bytes
    const size = Buffer.from(base64Data, 'base64').length;
    
    // Detect MIME type from data URL or default to jpeg
    const mimeTypeMatch = base64Image.match(/^data:image\/([^;]+);base64,/);
    const mimeType = mimeTypeMatch ? `image/${mimeTypeMatch[1]}` : 'image/jpeg';
    
    return { hash, size, mimeType };
  }

  /**
   * Generate collection hash for all images in pcfImages
   */
  static hashImageCollection(pcfImages: any, previousCollection?: any): ImageCollectionHashResult {
    const individualHashes: Record<string, string> = {};
    const previousHashes: Record<string, string> = {};
    let totalImages = 0;

    // Process previous collection if provided
    if (previousCollection) {
      this.extractHashesFromCollection(previousCollection, previousHashes);
    }

    // Process current collection
    this.extractHashesFromCollection(pcfImages, individualHashes);
    totalImages = Object.keys(individualHashes).length;

    // Create collection hash from sorted individual hashes
    const sortedHashes = Object.keys(individualHashes)
      .sort()
      .map(key => `${key}:${individualHashes[key]}`)
      .join('|');
    
    const collectionHash = crypto.createHash('sha256').update(sortedHashes).digest('hex');

    // Detect changed images
    const changedImages: string[] = [];
    for (const [key, hash] of Object.entries(individualHashes)) {
      if (previousHashes[key] && previousHashes[key] !== hash) {
        changedImages.push(key);
      }
    }

    return {
      collectionHash,
      totalImages,
      individualHashes,
      changedImages: changedImages.length > 0 ? changedImages : undefined
    };
  }

  /**
   * Extract hashes from a pcfImages collection
   */
  private static extractHashesFromCollection(
    pcfImages: any, 
    hashMap: Record<string, string>
  ): void {
    if (!pcfImages) return;

    // Process itemPackImages (nested arrays)
    if (pcfImages.itemPackImages) {
      pcfImages.itemPackImages.forEach((pack: any[], packIndex: number) => {
        pack.forEach((image: any, imageIndex: number) => {
          if (image.image) {
            const key = `itemPack_${packIndex}_${imageIndex}_${image.componentName}`;
            const hashResult = this.hashBase64Image(image.image);
            hashMap[key] = hashResult.hash;
          }
        });
      });
    }

    // Process other image arrays
    const imageCategories = [
      'itemBarcodeImages',
      'displayImages', 
      'innerCartonImages',
      'masterCartonImages'
    ];

    imageCategories.forEach(category => {
      if (pcfImages[category]) {
        pcfImages[category].forEach((image: any, index: number) => {
          if (image.image) {
            const key = `${category}_${index}_${image.componentName}`;
            const hashResult = this.hashBase64Image(image.image);
            hashMap[key] = hashResult.hash;
          }
        });
      }
    });
  }

  /**
   * Enhanced image processing with hashing
   */
  static processImagesWithHashing(pcfImages: any): any {
    if (!pcfImages) return pcfImages;

    const processedImages = JSON.parse(JSON.stringify(pcfImages));
    let totalImages = 0;
    let lastUpdate = new Date();

    // Process itemPackImages
    if (processedImages.itemPackImages) {
      processedImages.itemPackImages.forEach((pack: any[]) => {
        pack.forEach((image: any) => {
          if (image.image) {
            const hashResult = this.hashBase64Image(image.image);
            image.imageHash = hashResult.hash;
            image.imageSize = hashResult.size;
            image.imageMimeType = hashResult.mimeType;
            image.lastUpdated = lastUpdate;
            totalImages++;
          }
        });
      });
    }

    // Process other image categories
    const imageCategories = [
      'itemBarcodeImages',
      'displayImages',
      'innerCartonImages', 
      'masterCartonImages'
    ];

    imageCategories.forEach(category => {
      if (processedImages[category]) {
        processedImages[category].forEach((image: any) => {
          if (image.image) {
            const hashResult = this.hashBase64Image(image.image);
            image.imageHash = hashResult.hash;
            image.imageSize = hashResult.size;
            image.imageMimeType = hashResult.mimeType;
            image.lastUpdated = lastUpdate;
            totalImages++;
          }
        });
      }
    });

    // Add collection metadata
    const collectionHashResult = this.hashImageCollection(processedImages);
    processedImages.totalImageCount = totalImages;
    processedImages.lastImageUpdate = lastUpdate;
    processedImages.imageCollectionHash = collectionHashResult.collectionHash;

    return processedImages;
  }

  /**
   * Generate cache key for React Query
   */
  static generateCacheKey(assortmentId: string, version: number): string {
    return `assortment_${assortmentId}_v${version}_${Date.now()}`;
  }

  /**
   * Check if images need update based on hash comparison
   */
  static shouldUpdateImages(
    currentCollection: any,
    storedCollection: any
  ): boolean {
    if (!storedCollection) return true;

    const currentHash = this.hashImageCollection(currentCollection);
    const storedHash = this.hashImageCollection(storedCollection);

    return currentHash.collectionHash !== storedHash.collectionHash;
  }

  /**
   * Create version history entry
   */
  static createVersionHistoryEntry(
    version: number,
    collectionHash: string,
    changedImages?: string[],
    totalImages?: number
  ) {
    return {
      version,
      imageCollectionHash: collectionHash,
      receivedAt: new Date(),
      changedImages,
      totalImages
    };
  }

  /**
   * Cleanup old version history (keep last N versions)
   */
  static cleanupVersionHistory(
    versionHistory: any[],
    keepVersions: number = 10
  ): any[] {
    if (versionHistory.length <= keepVersions) {
      return versionHistory;
    }

    // Sort by version descending and keep the most recent
    return versionHistory
      .sort((a, b) => b.version - a.version)
      .slice(0, keepVersions);
  }

  /**
   * Calculate cache performance metrics
   */
  static updatePerformanceMetrics(
    existingMetrics: any,
    loadTime: number,
    cacheHit: boolean
  ) {
    const metrics = existingMetrics || {
      averageLoadTime: 0,
      cacheHitRate: 0,
      totalCacheHits: 0,
      totalCacheMisses: 0,
      lastPerformanceCheck: new Date()
    };

    // Update cache statistics
    if (cacheHit) {
      metrics.totalCacheHits = (metrics.totalCacheHits || 0) + 1;
    } else {
      metrics.totalCacheMisses = (metrics.totalCacheMisses || 0) + 1;
    }

    // Calculate hit rate
    const totalRequests = metrics.totalCacheHits + metrics.totalCacheMisses;
    metrics.cacheHitRate = totalRequests > 0 ? 
      (metrics.totalCacheHits / totalRequests) * 100 : 0;

    // Update average load time (simple moving average)
    const currentAvg = metrics.averageLoadTime || 0;
    metrics.averageLoadTime = (currentAvg + loadTime) / 2;

    metrics.lastPerformanceCheck = new Date();

    return metrics;
  }
}