// src/services/webhook.service.ts - Enhanced version with IMAGE UPLOAD
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookData } from '../schemas/webhook-data.schema';
import { IndividualAssortment } from '../schemas/individual-assortment.schema';
import { ImageVersioningUtil } from '../utils/image-versioning.util';

// Keep your existing interfaces
export interface OdooWebhookPayload {
  salesOrder: {
    id: string;
    customer: string;
    customer_po: string;
  };
  assortments: Array<{
    _id: number;
    customerItemNo: string;
    itemNo: string;
    name: string;
    orderId: number;
    productId: number;
    length_cm: number;
    width_cm: number;
    height_cm: number;
    master_carton_length_cm: number;
    master_carton_width_cm: number;
    master_carton_height_cm: number;
    inner_carton_length_cm: number;
    inner_carton_width_cm: number;
    inner_carton_height_cm: number;
    pcfImages: any;
  }>;
}

export interface IndividualAssortmentPayload {
  assortment: any;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectModel(WebhookData.name)
    private readonly webhookDataModel: Model<WebhookData>,
    @InjectModel(IndividualAssortment.name)
    private readonly individualAssortmentModel: Model<IndividualAssortment>,
  ) {}

  // NEW: Update assortment with uploaded images
  async updateAssortmentImages(
    assortmentId: string, 
    processedImages: any,
    imageLabels: any = {}
  ): Promise<any> {
    try {
      this.logger.log(`📝 Updating assortment ${assortmentId} with new images`);

      // Get current assortment data
      const currentAssortment = await this.individualAssortmentModel.findOne({
        assortmentId: assortmentId
      }).exec();

      if (!currentAssortment) {
        throw new Error(`Assortment ${assortmentId} not found for update`);
      }

      // Safely access user modifications with proper type casting and defaults
      const existingUserMods = (currentAssortment.assortmentData?.userModifications as any) || {};
      const existingUploadedImages = existingUserMods.uploadedImages || {
        itemPackImages: [],
        itemBarcodeImages: [],
        displayImages: [],
        innerCartonImages: [],
        masterCartonImages: []
      };

      // Merge uploaded images by category
      const mergedUploadedImages = {
        itemPackImages: [
          ...(existingUploadedImages.itemPackImages || []),
          ...(processedImages.itemPackImages || [])
        ],
        itemBarcodeImages: [
          ...(existingUploadedImages.itemBarcodeImages || []),
          ...(processedImages.itemBarcodeImages || [])
        ],
        displayImages: [
          ...(existingUploadedImages.displayImages || []),
          ...(processedImages.displayImages || [])
        ],
        innerCartonImages: [
          ...(existingUploadedImages.innerCartonImages || []),
          ...(processedImages.innerCartonImages || [])
        ],
        masterCartonImages: [
          ...(existingUploadedImages.masterCartonImages || []),
          ...(processedImages.masterCartonImages || [])
        ]
      };

      // Merge image labels
      const mergedImageLabels = {
        ...(existingUserMods.imageLabels || {}),
        ...imageLabels
      };

      // Create complete user modifications object
      const updatedUserModifications = {
        uploadedImages: mergedUploadedImages,
        imageLabels: mergedImageLabels,
        lastModified: new Date(),
        customFields: existingUserMods.customFields || {},
        formData: existingUserMods.formData || {}
      };

      // Update data with proper nested structure
      const updateData = {
        'assortmentData.userModifications': updatedUserModifications,
        'metadata.hasUserModifications': true,
        'metadata.lastImageUpload': new Date(),
        currentVersion: currentAssortment.currentVersion + 1,
        lastCacheUpdate: new Date()
      };

      const updatedAssortment = await this.individualAssortmentModel.findOneAndUpdate(
        { assortmentId: assortmentId },
        { $set: updateData },
        { new: true, upsert: false }
      ).exec();

      if (!updatedAssortment) {
        throw new Error(`Failed to update assortment ${assortmentId}`);
      }

      this.logger.log(`✅ Updated assortment ${assortmentId} with new images (v${updatedAssortment.currentVersion})`);

      // Return the updated assortment data in the format expected by frontend
      return {
        ...updatedAssortment.assortmentData,
        _version: updatedAssortment.currentVersion,
        _lastModified: new Date(),
        _hasUserModifications: true
      };

    } catch (error) {
      this.logger.error(`❌ Failed to update assortment images for ${assortmentId}:`, error);
      throw error;
    }
  }

  // ENHANCED: Save individual assortment with persistent storage and versioning
  async saveIndividualAssortment(assortment: any): Promise<IndividualAssortment> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`🔄 Saving individual assortment with persistent storage: ${assortment.itemNo}`);

      // Get existing data if it exists
      const existingData = await this.individualAssortmentModel.findOne({ 
        assortmentId: assortment.itemNo 
      });

      // Process images with hashing
      const processedPcfImages = ImageVersioningUtil.processImagesWithHashing(assortment.pcfImages);

      // Check if images have changed
      const shouldUpdate = !existingData || 
        ImageVersioningUtil.shouldUpdateImages(
          processedPcfImages, 
          existingData?.assortmentData?.pcfImages
        );

      if (!shouldUpdate && existingData) {
        this.logger.log(`📋 No image changes detected for ${assortment.itemNo}, updating access metrics only`);
        
        // Update access metrics and performance
        const performanceMetrics = ImageVersioningUtil.updatePerformanceMetrics(
          existingData.performanceMetrics,
          Date.now() - startTime,
          true // Cache hit
        );

        const updatedData = await this.individualAssortmentModel.findOneAndUpdate(
          { assortmentId: assortment.itemNo },
          {
            $inc: { accessCount: 1 },
            lastAccessedAt: new Date(),
            lastCacheUpdate: new Date(),
            performanceMetrics
          },
          { new: true }
        );

        return updatedData!;
      }

      // Calculate version and hash information
      const currentVersion = existingData ? existingData.currentVersion + 1 : 1;
      const collectionHashResult = ImageVersioningUtil.hashImageCollection(
        processedPcfImages,
        existingData?.assortmentData?.pcfImages
      );

      // Generate cache key
      const cacheKey = ImageVersioningUtil.generateCacheKey(assortment.itemNo, currentVersion);

      // Create version history entry
      const versionHistoryEntry = ImageVersioningUtil.createVersionHistoryEntry(
        currentVersion,
        collectionHashResult.collectionHash,
        collectionHashResult.changedImages,
        collectionHashResult.totalImages
      );

      // Prepare enhanced metadata
      const enhancedMetadata = {
        totalImages: collectionHashResult.totalImages,
        source: 'individual_webhook' as const,
        odooVersion: '17',
        originalId: assortment._id,
        imageCollectionHash: collectionHashResult.collectionHash,
        lastImageUpdate: new Date(),
        persistentStorageEnabled: true,
        cachingStrategy: 'aggressive' as const
      };

      // Calculate performance metrics
      const performanceMetrics = ImageVersioningUtil.updatePerformanceMetrics(
        existingData?.performanceMetrics,
        Date.now() - startTime,
        false // Cache miss (new/updated data)
      );

      const individualData = {
        assortmentId: assortment.itemNo,
        assortmentData: {
          ...assortment,
          pcfImages: processedPcfImages,
          // Initialize user modifications structure
          userModifications: existingData?.assortmentData?.userModifications || {
            uploadedImages: {
              itemPackImages: [],
              itemBarcodeImages: [],
              displayImages: [],
              innerCartonImages: [],
              masterCartonImages: []
            },
            imageLabels: {},
            lastModified: null
          }
        },
        status: 'received' as const,
        receivedAt: new Date(),
        accessCount: existingData ? existingData.accessCount + 1 : 1,
        currentVersion,
        cacheKey,
        lastCacheUpdate: new Date(),
        metadata: enhancedMetadata,
        performanceMetrics
      };

      if (existingData) {
        // Update existing record with versioning
        this.logger.log(`🔄 Updating existing individual assortment: ${assortment.itemNo} (v${currentVersion})`);
        
        // Clean up old version history
        const updatedVersionHistory = ImageVersioningUtil.cleanupVersionHistory([
          ...existingData.versionHistory,
          versionHistoryEntry
        ], 10);

        const updatedData = await this.individualAssortmentModel.findOneAndUpdate(
          { assortmentId: assortment.itemNo },
          {
            ...individualData,
            versionHistory: updatedVersionHistory,
            lastAccessedAt: new Date()
          },
          { new: true, upsert: false }
        );

        this.logger.log(`✅ Updated individual assortment: ${assortment.itemNo} (v${currentVersion}) with ${collectionHashResult.totalImages} images`);
        if (collectionHashResult.changedImages?.length) {
          this.logger.log(`🔄 Changed images: ${collectionHashResult.changedImages.join(', ')}`);
        }
        
        return updatedData!;
      } else {
        // Create new record
        this.logger.log(`🆕 Creating new individual assortment: ${assortment.itemNo} (v${currentVersion})`);
        
        const newIndividualAssortment = new this.individualAssortmentModel({
          ...individualData,
          versionHistory: [versionHistoryEntry]
        });
        
        const savedData = await newIndividualAssortment.save();
        
        this.logger.log(`✅ Created individual assortment: ${assortment.itemNo} (v${currentVersion}) with ${collectionHashResult.totalImages} images`);
        return savedData;
      }
    } catch (error) {
      this.logger.error(`❌ Failed to save individual assortment ${assortment.itemNo}:`, error);
      throw error;
    }
  }

  // ENHANCED: Get individual assortment with performance tracking
  async getIndividualAssortmentData(assortmentId: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`🔍 Getting individual assortment data with caching: ${assortmentId}`);
      
      const individualData = await this.individualAssortmentModel.findOne({
        assortmentId: assortmentId
      }).exec();

      if (individualData) {
        this.logger.log(`✅ Found cached individual assortment: ${assortmentId} (v${individualData.currentVersion})`);
        
        // Update performance metrics
        const loadTime = Date.now() - startTime;
        const performanceMetrics = ImageVersioningUtil.updatePerformanceMetrics(
          individualData.performanceMetrics,
          loadTime,
          true // Cache hit
        );

        // Update access metrics
        await this.individualAssortmentModel.findOneAndUpdate(
          { assortmentId: assortmentId },
          {
            $inc: { accessCount: 1 },
            lastAccessedAt: new Date(),
            performanceMetrics
          }
        );

        // Return the enhanced assortment data
        return {
          ...individualData.assortmentData,
          // Add caching metadata for the frontend
          _individualAssortmentId: individualData._id,
          _accessCount: individualData.accessCount + 1,
          _lastAccessed: new Date(),
          _version: individualData.currentVersion,
          _cacheKey: individualData.cacheKey,
          _imageCollectionHash: individualData.metadata?.imageCollectionHash,
          _persistentStorageEnabled: true,
          _performanceMetrics: performanceMetrics
        };
      }

      this.logger.log(`❌ No cached individual assortment found for: ${assortmentId}`);
      return null;
    } catch (error) {
      this.logger.error(`❌ Failed to get individual assortment data for ${assortmentId}:`, error);
      return null;
    }
  }

  // NEW: Get assortment with cache validation
  async getIndividualAssortmentWithCacheValidation(
    assortmentId: string, 
    expectedImageHash?: string
  ): Promise<{ data: any; cacheValid: boolean; version: number }> {
    try {
      const individualData = await this.individualAssortmentModel.findOne({
        assortmentId: assortmentId
      }).exec();

      if (!individualData) {
        return { data: null, cacheValid: false, version: 0 };
      }

      const currentImageHash = individualData.metadata?.imageCollectionHash;
      const cacheValid = !expectedImageHash || currentImageHash === expectedImageHash;

      this.logger.log(
        `🔍 Cache validation for ${assortmentId}: ${cacheValid ? 'VALID' : 'INVALID'} ` +
        `(v${individualData.currentVersion})`
      );

      return {
        data: individualData.assortmentData,
        cacheValid,
        version: individualData.currentVersion
      };
    } catch (error) {
      this.logger.error(`❌ Cache validation failed for ${assortmentId}:`, error);
      return { data: null, cacheValid: false, version: 0 };
    }
  }

  // NEW: Cache management methods
  async invalidateAssortmentCache(assortmentId: string): Promise<boolean> {
    try {
      this.logger.log(`🗑️ Invalidating cache for assortment: ${assortmentId}`);
      
      const result = await this.individualAssortmentModel.findOneAndUpdate(
        { assortmentId },
        {
          cacheKey: ImageVersioningUtil.generateCacheKey(assortmentId, Date.now()),
          lastCacheUpdate: new Date()
        }
      );

      return !!result;
    } catch (error) {
      this.logger.error(`❌ Failed to invalidate cache for ${assortmentId}:`, error);
      return false;
    }
  }

  async cleanupOldCacheEntries(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await this.individualAssortmentModel.deleteMany({
        lastAccessedAt: { $lt: cutoffDate },
        accessCount: { $lt: 5 } // Only delete rarely accessed items
      });

      this.logger.log(`🧹 Cleaned up ${result.deletedCount} old cache entries`);
      return result.deletedCount;
    } catch (error) {
      this.logger.error('❌ Failed to cleanup old cache entries:', error);
      return 0;
    }
  }

  // NEW: Get cache statistics
  async getCacheStatistics(): Promise<any> {
    try {
      const totalAssortments = await this.individualAssortmentModel.countDocuments();
      const recentlyAccessed = await this.individualAssortmentModel.countDocuments({
        lastAccessedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      const performanceStats = await this.individualAssortmentModel.aggregate([
        {
          $group: {
            _id: null,
            avgLoadTime: { $avg: '$performanceMetrics.averageLoadTime' },
            avgCacheHitRate: { $avg: '$performanceMetrics.cacheHitRate' },
            totalCacheHits: { $sum: '$performanceMetrics.totalCacheHits' },
            totalCacheMisses: { $sum: '$performanceMetrics.totalCacheMisses' }
          }
        }
      ]);

      return {
        totalAssortments,
        recentlyAccessed,
        performance: performanceStats[0] || {
          avgLoadTime: 0,
          avgCacheHitRate: 0,
          totalCacheHits: 0,
          totalCacheMisses: 0
        }
      };
    } catch (error) {
      this.logger.error('❌ Failed to get cache statistics:', error);
      return null;
    }
  }

  // Keep all your existing methods unchanged...
  async saveWebhookData(orderName: string, payload: OdooWebhookPayload): Promise<WebhookData> {
    try {
      const metadata = {
        totalImages: this.countTotalImages(payload.assortments),
        assortmentCount: payload.assortments.length,
        source: 'odoo',
        odooVersion: '17'
      };

      const existingData = await this.webhookDataModel.findOne({ orderName });

      if (existingData) {
        this.logger.log(`Updating existing webhook data for order: ${orderName}`);
        
        const updatedData = await this.webhookDataModel.findOneAndUpdate(
          { orderName },
          {
            salesOrder: payload.salesOrder,
            assortments: payload.assortments,
            status: 'received',
            receivedAt: new Date(),
            metadata,
            $unset: { errorMessage: 1 }
          },
          { new: true, upsert: false }
        );

        return updatedData;
      } else {
        this.logger.log(`Creating new webhook data for order: ${orderName}`);
        
        const webhookData = new this.webhookDataModel({
          orderName,
          salesOrder: payload.salesOrder,
          assortments: payload.assortments,
          status: 'received',
          receivedAt: new Date(),
          metadata
        });

        return await webhookData.save();
      }
    } catch (error) {
      this.logger.error(`Failed to save webhook data for ${orderName}:`, error);
      
      try {
        await this.webhookDataModel.findOneAndUpdate(
          { orderName },
          {
            status: 'error',
            errorMessage: error.message,
            receivedAt: new Date()
          },
          { upsert: true }
        );
      } catch (saveErrorError) {
        this.logger.error('Failed to save error state:', saveErrorError);
      }
      
      throw error;
    }
  }

  async getAssortmentFromSalesOrder(searchCriteria: any, assortmentId: string): Promise<any> {
    try {
        console.log(`🔍 Searching sales order data with criteria:`, searchCriteria);
        
        const webhookData = await this.webhookDataModel.findOne(searchCriteria).exec();

        if (!webhookData) {
        console.log(`❌ No sales order found with criteria:`, searchCriteria);
        return null;
        }

        console.log(`✅ Found sales order: ${webhookData.orderName}`);

        let assortment: any;
        
        if (assortmentId.startsWith('A')) {
        assortment = webhookData.assortments.find(a => a.itemNo === assortmentId);
        } else {
        const numericId = parseInt(assortmentId, 10);
        assortment = webhookData.assortments.find(a => a._id === numericId);
        }

        if (!assortment) {
        console.log(`❌ Assortment ${assortmentId} not found in sales order ${webhookData.orderName}`);
        return null;
        }

        console.log(`✅ Found assortment ${assortmentId} in sales order ${webhookData.orderName}`);
        
        return {
        ...assortment,
        salesOrder: webhookData.salesOrder,
        orderName: webhookData.orderName
        };
    } catch (error) {
        this.logger.error(`Failed to search assortment from sales order for ${assortmentId}:`, error);
        return null;
    }
  }

  async getWebhookData(orderName: string): Promise<WebhookData | null> {
    try {
      return await this.webhookDataModel.findOne({ orderName }).exec();
    } catch (error) {
      this.logger.error(`Failed to get webhook data for ${orderName}:`, error);
      return null;
    }
  }

  async getAssortmentData(assortmentId: number): Promise<any> {
    try {
      const webhookData = await this.webhookDataModel.findOne({
        'assortments._id': assortmentId
      }).exec();

      if (!webhookData) {
        return null;
      }

      const assortment = webhookData.assortments.find(a => a._id === assortmentId);
      
      return {
        ...assortment,
        salesOrder: webhookData.salesOrder,
        orderName: webhookData.orderName
      };
    } catch (error) {
      this.logger.error(`Failed to get assortment data for ${assortmentId}:`, error);
      return null;
    }
  }

  async markAsProcessed(orderName: string): Promise<void> {
    try {
      await this.webhookDataModel.findOneAndUpdate(
        { orderName },
        {
          status: 'processed',
          processedAt: new Date()
        }
      );
      this.logger.log(`Marked webhook data as processed for order: ${orderName}`);
    } catch (error) {
      this.logger.error(`Failed to mark as processed for ${orderName}:`, error);
    }
  }

  async getRecentWebhooks(limit: number = 50): Promise<WebhookData[]> {
    try {
      return await this.webhookDataModel
        .find({ 
          orderName: { $not: /^INDIVIDUAL_/ }
        })
        .sort({ receivedAt: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      this.logger.error('Failed to get recent webhooks:', error);
      return [];
    }
  }

  async deleteOldWebhooks(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await this.webhookDataModel.deleteMany({
        receivedAt: { $lt: cutoffDate }
      });

      this.logger.log(`Deleted ${result.deletedCount} old webhook records`);
      return result.deletedCount;
    } catch (error) {
      this.logger.error('Failed to delete old webhooks:', error);
      return 0;
    }
  }

  private countTotalImages(assortments: any[]): number {
    return assortments.reduce((total, assortment) => {
      const pcfImages = assortment.pcfImages;
      if (!pcfImages) return total;

      const itemPackCount = pcfImages.itemPackImages?.reduce(
        (acc: number, pack: any[]) => acc + pack.length, 0
      ) || 0;
      
      const otherImagesCount = (pcfImages.itemBarcodeImages?.length || 0) +
                               (pcfImages.displayImages?.length || 0) +
                               (pcfImages.innerCartonImages?.length || 0) +
                               (pcfImages.masterCartonImages?.length || 0);

      return total + itemPackCount + otherImagesCount;
    }, 0);
  }

  async findImageByFilename(filename: string): Promise<{ imageBuffer: Buffer; mimetype: string; size: number } | null> {
    try {
      this.logger.log(`🔍 Searching for image file: ${filename}`);

      // Search through all assortments for the image
      const assortments = await this.individualAssortmentModel.find({
        'assortmentData.userModifications.uploadedImages': { $exists: true }
      }).exec();

      for (const assortment of assortments) {
        const userMods = assortment.assortmentData?.userModifications as any;
        if (!userMods?.uploadedImages) continue;

        // Search through all image categories
        const categories = ['itemPackImages', 'itemBarcodeImages', 'displayImages', 'innerCartonImages', 'masterCartonImages'];
        
        for (const category of categories) {
          const images = userMods.uploadedImages[category] || [];
          
          for (const image of images) {
            if (image.filename === filename || image.originalname === filename) {
              this.logger.log(`✅ Found image ${filename} in ${assortment.assortmentId}/${category}`);
              
              // Return the image data
              return {
                imageBuffer: image.buffer,
                mimetype: image.mimetype,
                size: image.size
              };
            }
          }
        }
      }

      this.logger.warn(`❌ Image ${filename} not found in any assortment`);
      return null;

    } catch (error) {
      this.logger.error(`❌ Error searching for image ${filename}:`, error);
      return null;
    }
  }

  async deleteMultipleImages(
    assortmentId: string,
    imageIds: string[],
  ): Promise<{ success: boolean; message: string; deletedCount: number; updatedAssortment?: any }> {
    const startTime = Date.now();
    
    // Only log essential info
    this.logger.log(`🗑️ Processing ${imageIds.length} image deletions for ${assortmentId}`);

    try {
      // OPTIMIZED: Use lean() for faster queries and avoid unnecessary document conversion
      const currentAssortment = await this.individualAssortmentModel.findOne({
        assortmentId: assortmentId,
      }).lean().exec();

      if (!currentAssortment) {
        return { success: false, message: `Assortment ${assortmentId} not found`, deletedCount: 0 };
      }

      const userMods = currentAssortment.assortmentData?.userModifications;
      if (!userMods?.uploadedImages) {
        return { success: true, message: 'No uploaded images found to delete.', deletedCount: 0 };
      }

      let deletedCount = 0;
      const imageIdSet = new Set(imageIds); // Efficient lookup
      
      // OPTIMIZED: Build the update payload more efficiently
      const updatePayload: Record<string, any> = {
        'assortmentData.userModifications.lastModified': new Date(),
        'currentVersion': currentAssortment.currentVersion + 1,
        'lastCacheUpdate': new Date(),
        'metadata.hasUserModifications': true,
      };

      // OPTIMIZED: Process categories more efficiently
      const categories = ['itemPackImages', 'itemBarcodeImages', 'displayImages', 'innerCartonImages', 'masterCartonImages'];
      
      for (const category of categories) {
        const originalImages = userMods.uploadedImages[category] || [];
        if (originalImages.length === 0) continue;

        const filteredImages = originalImages.filter((img: any) => {
          const filename = img.filename || img.originalname;
          const shouldDelete = imageIdSet.has(filename);
          if (shouldDelete) deletedCount++;
          return !shouldDelete; // Keep if not deleting
        });

        // Only update if there's a change
        if (filteredImages.length !== originalImages.length) {
          updatePayload[`assortmentData.userModifications.uploadedImages.${category}`] = filteredImages;
        }
      }

      if (deletedCount === 0) {
        return { 
          success: true, 
          message: 'No matching images found to delete.', 
          deletedCount: 0,
          updatedAssortment: currentAssortment.assortmentData 
        };
      }

      // OPTIMIZED: Single database operation with minimal logging
      const result = await this.individualAssortmentModel.findOneAndUpdate(
        { assortmentId: assortmentId },
        { $set: updatePayload },
        { 
          new: true, 
          lean: true, // Return plain object instead of Mongoose document
          // Remove runValidators for better performance if not critical
        }
      ).exec();

      if (!result) {
        throw new Error('Database update failed');
      }

      const duration = Date.now() - startTime;
      this.logger.log(`✅ Deleted ${deletedCount} images in ${duration}ms`);

      return {
        success: true,
        message: `${deletedCount} images deleted successfully.`,
        deletedCount,
        updatedAssortment: result.assortmentData,
      };

    } catch (dbError) {
      const duration = Date.now() - startTime;
      this.logger.error(`💥 Delete operation failed after ${duration}ms:`, dbError.message);
      return { 
        success: false, 
        message: 'Database error during batch delete.', 
        deletedCount: 0 
      };
    }
  }

  async deleteAssortmentImage(
    assortmentId: string,
    imageId: string,
    category?: string,
    imageIndex?: number
  ): Promise<{ success: boolean; message: string; updatedAssortment?: any }> {
    this.logger.log(`🗑️ Single delete request: imageId="${imageId}", assortmentId="${assortmentId}"`);

    const currentAssortment = await this.individualAssortmentModel.findOne({
      assortmentId: assortmentId
    }).exec();

    if (!currentAssortment) {
      this.logger.error(`❌ Assortment ${assortmentId} not found.`);
      return { success: false, message: `Assortment ${assortmentId} not found` };
    }

    const assortmentObj = currentAssortment.toObject();
    const userMods = assortmentObj.assortmentData?.userModifications;
    
    if (!userMods?.uploadedImages) {
      this.logger.error(`❌ No uploadedImages found for assortment ${assortmentId}.`);
      return { success: false, message: 'No uploaded images found for this assortment.' };
    }

    let imageFound = false;
    let foundInCategory = '';
    
    // Find and remove the image
    for (const cat of Object.keys(userMods.uploadedImages)) {
      const images = userMods.uploadedImages[cat] || [];
      const initialLength = images.length;

      userMods.uploadedImages[cat] = images.filter((img: any) => {
        const filename = img.filename || img.originalname;
        const match = filename === imageId;
        if (match) {
          this.logger.log(`🎯 Found and removing "${imageId}" from category "${cat}"`);
          imageFound = true;
          foundInCategory = cat;
        }
        return !match;
      });

      if (userMods.uploadedImages[cat].length < initialLength) {
        this.logger.log(`✂️ Category "${cat}": ${initialLength} → ${userMods.uploadedImages[cat].length} images`);
      }
    }

    if (!imageFound) {
      this.logger.error(`❌ Image "${imageId}" not found in any category.`);
      return { success: false, message: `Image ${imageId} not found` };
    }

    // FIX: Use the same update structure as batch delete
    const updatePayload = {
      'assortmentData.userModifications.uploadedImages': userMods.uploadedImages,
      'assortmentData.userModifications.lastModified': new Date(),
      'currentVersion': currentAssortment.currentVersion + 1,
      'lastCacheUpdate': new Date(),
      'metadata.hasUserModifications': true,
    };

    try {
      this.logger.log(`💾 Executing single image deletion...`);
      
      const result = await this.individualAssortmentModel.findOneAndUpdate(
        { assortmentId: assortmentId },
        { $set: updatePayload },
        { new: true, runValidators: true }
      ).exec();

      if (!result) {
        this.logger.error('❌ Database update failed - returned null.');
        return { success: false, message: 'Database update failed.' };
      }

      this.logger.log(`✅ Successfully deleted "${imageId}" from category "${foundInCategory}"`);

      return {
        success: true,
        message: 'Image deleted successfully',
        updatedAssortment: result.assortmentData
      };

    } catch (dbError) {
      this.logger.error('💥 Database error during single delete:', dbError);
      return { success: false, message: `Database error: ${dbError.message}` };
    }
  }

  async getWebhookStats(): Promise<any> {
    try {
      const total = await this.webhookDataModel.countDocuments({
        orderName: { $not: /^INDIVIDUAL_/ }
      });
      const recent = await this.webhookDataModel.countDocuments({
        orderName: { $not: /^INDIVIDUAL_/ },
        receivedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      const errors = await this.webhookDataModel.countDocuments({ 
        status: 'error',
        orderName: { $not: /^INDIVIDUAL_/ }
      });
      const individualCount = await this.individualAssortmentModel.countDocuments();

      // Get cache statistics
      const cacheStats = await this.getCacheStatistics();

      return {
        total,
        recent24h: recent,
        errors,
        individualAssortments: individualCount,
        successRate: total > 0 ? ((total - errors) / total * 100).toFixed(2) + '%' : '0%',
        cacheStatistics: cacheStats
      };
    } catch (error) {
      this.logger.error('Failed to get webhook stats:', error);
      return { 
        total: 0, 
        recent24h: 0, 
        errors: 0, 
        individualAssortments: 0, 
        successRate: '0%',
        cacheStatistics: null
      };
    }
  }
}