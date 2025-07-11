// src/lib/react-query-persistent-fixed.ts
// Fixed version compatible with your current React Query setup

import { QueryClient } from '@tanstack/react-query';

// Simple storage manager without deprecated APIs
class AssortmentStorageManager {
  private static readonly STORAGE_KEY = 'assortment-cache';
  private static readonly VERSION_KEY = 'assortment-cache-version';
  private static readonly CURRENT_VERSION = '1.0.1'; // Bump version to invalidate old caches

  // ✅ ADDED: New helper function to remove large image data for caching.
  private static stripLargeImageData(data: any): any {
    if (!data) return null;

    try {
      // Deep clone the object to avoid mutating the in-memory data used by React Query
      const clonedData = JSON.parse(JSON.stringify(data));

      // 1. Strip base64 from Odoo images (pcfImages)
      if (clonedData.pcfImages) {
        const odooImageCategories = [
          'itemBarcodeImages',
          'displayImages',
          'innerCartonImages',
          'masterCartonImages',
        ];

        // Handle standard image arrays
        odooImageCategories.forEach(category => {
          if (Array.isArray(clonedData.pcfImages[category])) {
            clonedData.pcfImages[category].forEach((img: any) => {
              if (img && 'image' in img) {
                delete img.image; // Remove the large base64 string
              }
            });
          }
        });

        // Handle nested itemPackImages array
        if (Array.isArray(clonedData.pcfImages.itemPackImages)) {
          clonedData.pcfImages.itemPackImages.forEach((pack: any[]) => {
            if (Array.isArray(pack)) {
              pack.forEach((img: any) => {
                if (img && 'image' in img) {
                  delete img.image; // Remove the large base64 string
                }
              });
            }
          });
        }
      }

      // 2. Strip buffers from user-uploaded images
      if (clonedData.userModifications?.uploadedImages) {
        const userImageCategories = Object.keys(clonedData.userModifications.uploadedImages);
        userImageCategories.forEach(category => {
          if (Array.isArray(clonedData.userModifications.uploadedImages[category])) {
            clonedData.userModifications.uploadedImages[category].forEach((file: any) => {
              if (file && 'buffer' in file) {
                delete file.buffer; // Remove the large buffer object
              }
            });
          }
        });
      }

      return clonedData;
    } catch (e) {
      console.error("Failed to strip image data for caching:", e);
      return data; // Return original data on error
    }
  }

  static isStorageAvailable(): boolean {
    try {
      const test = 'storage-test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static getStoredVersion(): string | null {
    try {
      return localStorage.getItem(this.VERSION_KEY);
    } catch {
      return null;
    }
  }

  static setStoredVersion(version: string): void {
    try {
      localStorage.setItem(this.VERSION_KEY, version);
    } catch {
      // Silently fail if storage is not available
    }
  }

  static clearStorageIfVersionMismatch(): void {
    const storedVersion = this.getStoredVersion();
    if (storedVersion !== this.CURRENT_VERSION) {
      this.clearStorage();
      this.setStoredVersion(this.CURRENT_VERSION);
    }
  }

  static clearStorage(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('assortment') || key.includes('packing-instruction')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Silently fail if storage is not available
    }
  }

  static getCacheKey(assortmentId: string): string {
    return `${this.STORAGE_KEY}-${assortmentId}`;
  }

  // ✅ MODIFIED: This function now strips large data before saving.
  static setAssortmentData(assortmentId: string, data: any): void {
    try {
      const cacheKey = this.getCacheKey(assortmentId);

      // Create a sanitized copy of the data with large fields removed
      const sanitizedDataForStorage = this.stripLargeImageData(data);

      const enhancedData = {
        data: sanitizedDataForStorage, // Use the sanitized data for storage
        _persistedAt: Date.now(),
        _version: this.CURRENT_VERSION,
      };

      localStorage.setItem(cacheKey, JSON.stringify(enhancedData));
    } catch (error) {
      // This will now be much less likely to throw a QuotaExceededError
      console.warn('Failed to store assortment data:', error);
    }
  }

  static getAssortmentData(assortmentId: string): any {
    try {
      const cacheKey = this.getCacheKey(assortmentId);
      const cachedString = localStorage.getItem(cacheKey);
      
      if (!cachedString) return null;

      const cachedData = JSON.parse(cachedString);
      
      const maxAge = 24 * 60 * 60 * 1000;
      if (cachedData._persistedAt && (Date.now() - cachedData._persistedAt) > maxAge) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.warn('Failed to retrieve assortment data:', error);
      return null;
    }
  }

  static removeAssortmentData(assortmentId: string): void {
    try {
      const cacheKey = this.getCacheKey(assortmentId);
      localStorage.removeItem(cacheKey);
    } catch {
      // Silently fail
    }
  }
}

// Enhanced query client configuration with current APIs
export const createEnhancedQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Use gcTime instead of deprecated cacheTime
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 24 * 60 * 60 * 1000, // 24 hours (new name for cacheTime)
        retry: (failureCount, error: any) => {
          if (error?.response?.status === 404) {
            return false;
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchInterval: false,
      },
      mutations: {
        retry: 2,
      },
    },
  });

  // Clear cache if version mismatch
  AssortmentStorageManager.clearStorageIfVersionMismatch();

  return queryClient;
};

// Simple cache management without deprecated APIs
export class SimpleCacheManager {
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  // Invalidate assortment cache
  async invalidateAssortmentCache(assortmentId: string): Promise<void> {
    await this.queryClient.invalidateQueries({
      queryKey: ['packing-instruction', 'webhook-assortment', assortmentId]
    });
    
    // Also clear localStorage
    AssortmentStorageManager.removeAssortmentData(assortmentId);
  }

  // Set assortment data in both React Query and localStorage
  setAssortmentData(assortmentId: string, data: any): void {
    // Set in React Query cache
    this.queryClient.setQueryData(
      ['packing-instruction', 'webhook-assortment', assortmentId],
      data
    );
    
    // Set in localStorage
    AssortmentStorageManager.setAssortmentData(assortmentId, data);
  }

  // Get cached assortment data (React Query first, then localStorage)
  getCachedAssortmentData(assortmentId: string): any {
    // Try React Query cache first
    const reactQueryData = this.queryClient.getQueryData([
      'packing-instruction', 
      'webhook-assortment', 
      assortmentId
    ]);
    
    if (reactQueryData) {
      return reactQueryData;
    }

    // Fallback to localStorage
    return AssortmentStorageManager.getAssortmentData(assortmentId);
  }

  // Check if assortment is cached and fresh
  isAssortmentCached(assortmentId: string): boolean {
    // Check React Query cache
    const query = this.queryClient.getQueryCache().find({
      queryKey: ['packing-instruction', 'webhook-assortment', assortmentId]
    });
    
    if (query && !query.isStale()) {
      return true;
    }

    // Check localStorage
    const localData = AssortmentStorageManager.getAssortmentData(assortmentId);
    return !!localData;
  }

  // Clear all caches
  clearAllCaches(): void {
    this.queryClient.clear();
    AssortmentStorageManager.clearStorage();
  }

  // Get simple cache statistics
  getCacheStats(): {
    totalQueries: number;
    assortmentQueries: number;
    staleQueries: number;
    cachedAssortments: string[];
  } {
    const queryCache = this.queryClient.getQueryCache();
    const allQueries = queryCache.getAll();
    
    const assortmentQueries = allQueries.filter(query => {
      const queryKey = query.queryKey as string[];
      return queryKey.some(key => 
        typeof key === 'string' && 
        (key.includes('assortment') || key.includes('packing-instruction'))
      );
    });

    const staleQueries = assortmentQueries.filter(query => query.isStale());
    
    const cachedAssortments = assortmentQueries
      .map(query => {
        const queryKey = query.queryKey as string[];
        return queryKey[queryKey.length - 1];
      })
      .filter(id => typeof id === 'string' && id.startsWith('A'));

    return {
      totalQueries: allQueries.length,
      assortmentQueries: assortmentQueries.length,
      staleQueries: staleQueries.length,
      cachedAssortments,
    };
  }
}

// Hook for accessing cache manager
export const useSimpleCacheManager = (queryClient: QueryClient) => {
  return new SimpleCacheManager(queryClient);
};