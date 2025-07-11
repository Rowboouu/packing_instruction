// @/features/packing-instructions/api/getAssortment.ts
// FIXED VERSION - Uses shared transformers

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { api } from '@/lib/axios-client';
import { QUERY_KEYS } from '@/constant/query-key';
import { QueryConfig } from '@/lib/react-query';
import { AssortmentData } from '../types';
import { useSimpleCacheManager } from '@/lib/react-query-persistent';
import { 
  transformRawDataToAssortmentData, 
  transformIndividualAssortmentResponse 
} from '../utils/transformers';

// Traditional API
export async function getAssortment(_id: string): Promise<AssortmentData> {
  const res = await api.get<any>(`/packing-instruction/assortment/${_id}`);
  return transformRawDataToAssortmentData(res.data, 'traditional');
}

// Enhanced webhook API with shared transformers
export async function getWebhookAssortmentWithCaching(_id: string): Promise<AssortmentData> {
  const res = await api.get<{
    success: boolean;
    data?: any;
    source?: 'individual' | 'sales_order';
    message?: string;
    assortmentId: string;
  }>(`/webhook/assortment/${_id}`);

  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || `Webhook assortment ${_id} not found`);
  }

  // Use shared transformer
  return transformIndividualAssortmentResponse(res.data.data);
}

// Query configurations
export const getAssortmentQuery = (_id: string) => ({
  queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'assortment', _id],
  queryFn: () => getAssortment(_id),
});

export const getWebhookAssortmentQuery = (_id: string) => ({
  queryKey: [QUERY_KEYS.PACKING_INSTRUCTION, 'webhook-assortment', _id],
  queryFn: () => getWebhookAssortmentWithCaching(_id),
});

// Basic hooks
export function useGetAssortment(
  _id: string,
  options?: QueryConfig<typeof getAssortment>,
) {
  return useQuery({
    ...getAssortmentQuery(_id),
    enabled: !!_id && _id.startsWith('A'),
    ...options,
  });
}

export function useGetWebhookAssortment(
  _id: string,
  options?: QueryConfig<typeof getWebhookAssortmentWithCaching>,
) {
  return useQuery({
    ...getWebhookAssortmentQuery(_id),
    enabled: !!_id && _id.startsWith('A'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  });
}

// FIXED: Enhanced smart hook WITHOUT infinite loop
export function useGetAssortmentSmart(
  _id: string,
  preferWebhook: boolean = true,
  options?: any,
) {
  const queryClient = useQueryClient();
  const cacheManager = useSimpleCacheManager(queryClient);
  
  // FIX: Use refs to prevent infinite loops
  const cacheCheckedRef = useRef(false);
  const lastSuccessfulDataRef = useRef<any>(null);

  // Check cached data only once on mount
  const isCached = !cacheCheckedRef.current ? cacheManager.isAssortmentCached(_id) : false;
  const cachedData = !cacheCheckedRef.current ? cacheManager.getCachedAssortmentData(_id) : undefined;
  
  // Enhanced webhook query
  const webhookQuery = useGetWebhookAssortment(_id, {
    enabled: !!_id && _id.startsWith('A') && preferWebhook,
    initialData: isCached ? cachedData : undefined,
    ...options,
  });

  // Traditional fallback query
  const traditionalQuery = useGetAssortment(_id, {
    enabled: !!_id && _id.startsWith('A') && (!preferWebhook || webhookQuery.isError),
    retry: 1,
    ...options,
  });

  // FIX: Use useEffect to handle caching side effects WITHOUT causing re-renders
  useEffect(() => {
    if (!cacheCheckedRef.current) {
      cacheCheckedRef.current = true;
    }

    // Only update cache when we have NEW successful data
    if (webhookQuery.isSuccess && webhookQuery.data && webhookQuery.data !== lastSuccessfulDataRef.current) {
      lastSuccessfulDataRef.current = webhookQuery.data;
      // Store in cache without triggering re-render
      cacheManager.setAssortmentData(_id, webhookQuery.data);
    }
  }, [webhookQuery.isSuccess, webhookQuery.data, _id, cacheManager]);

  // Return best available data WITHOUT calling setState-like functions
  if (preferWebhook && webhookQuery.isSuccess && webhookQuery.data) {
    return {
      ...webhookQuery,
      dataSource: 'webhook-cached' as const,
      cacheStats: cacheManager.getCacheStats(),
    };
  }

  if (traditionalQuery.isSuccess && traditionalQuery.data) {
    return {
      ...traditionalQuery,
      dataSource: 'traditional' as const,
      cacheStats: cacheManager.getCacheStats(),
    };
  }

  return {
    ...webhookQuery,
    dataSource: 'webhook-cached' as const,
    cacheStats: cacheManager.getCacheStats(),
  };
}

// Cache management hooks
export function useInvalidateAssortmentCache() {
  const queryClient = useQueryClient();
  const cacheManager = useSimpleCacheManager(queryClient);

  return {
    invalidateAssortment: (assortmentId: string) => {
      return cacheManager.invalidateAssortmentCache(assortmentId);
    },
    invalidateAllAssortments: () => {
      return queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PACKING_INSTRUCTION]
      });
    },
    clearAllCaches: () => {
      cacheManager.clearAllCaches();
    },
    getCacheStats: () => {
      return cacheManager.getCacheStats();
    }
  };
}