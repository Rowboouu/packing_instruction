import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Patch,
  Param, 
  Body, 
  Query, 
  HttpStatus, 
  Logger,
  UseInterceptors,
  UploadedFiles,
  Res 
} from '@nestjs/common';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { WebhookService, OdooWebhookPayload, IndividualAssortmentPayload } from '../services/webhook.service';

interface UploadAssortmentImagesDto {
  componentNo?: string;
  isWebhookData?: boolean;
  imageLabels?: string; // JSON string
  fileMapping?: string; // JSON string mapping file index to category
}

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  // NEW: IMAGE UPLOAD ENDPOINT
  @Patch('assortment/:assortmentId/images')
  @UseInterceptors(FilesInterceptor('files', 50)) // Changed from 'images' to 'files'
  async uploadAssortmentImages(
    @Param('assortmentId') assortmentId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadData: UploadAssortmentImagesDto,
  ) {
    try {
      this.logger.log(`📤 Uploading images for assortment: ${assortmentId}`);
      this.logger.log(`📁 Received ${files?.length || 0} files`);
      this.logger.log(`📋 Upload data:`, uploadData);

      // Debug: Log field names of received files
      if (files && files.length > 0) {
        this.logger.log(`📋 Received file field names:`, files.map(f => f.fieldname));
      }

      // Parse file mapping if provided
      let fileMapping: Record<string, string> = {};
      if (uploadData.fileMapping) {
        try {
          fileMapping = JSON.parse(uploadData.fileMapping);
          this.logger.log(`📋 File mapping:`, fileMapping);
        } catch (error) {
          this.logger.warn('Failed to parse fileMapping:', error);
        }
      }

      // Parse image labels if provided
      let imageLabels = {};
      if (uploadData.imageLabels) {
        try {
          imageLabels = JSON.parse(uploadData.imageLabels);
        } catch (error) {
          this.logger.warn('Failed to parse imageLabels:', error);
        }
      }

      // Get current assortment data
      const currentAssortment = await this.webhookService.getIndividualAssortmentData(assortmentId);
      
      if (!currentAssortment) {
        return {
          success: false,
          message: `Assortment not found: ${assortmentId}`,
          assortmentId
        };
      }

      // Process uploaded files by category using file mapping
      const processedImages = this.processUploadedFiles(files, imageLabels, fileMapping);
      
      // Update assortment with new images
      const updatedAssortment = await this.webhookService.updateAssortmentImages(
        assortmentId, 
        processedImages,
        imageLabels
      );

      this.logger.log(`✅ Successfully updated assortment ${assortmentId} with ${files?.length || 0} images`);

      return {
        success: true,
        message: 'Images uploaded successfully',
        assortmentId,
        uploadedImageCount: files?.length || 0,
        data: updatedAssortment
      };

    } catch (error) {
      this.logger.error(`❌ Failed to upload images for ${assortmentId}:`, error);
      
      return {
        success: false,
        error: 'Image upload failed',
        message: error.message,
        assortmentId
      };
    }
  }

  // @Delete('assortment/:assortmentId/images/:imageId')
  // async deleteAssortmentImage(
  //   @Param('assortmentId') assortmentId: string,
  //   @Param('imageId') imageId: string,
  //   @Body() deleteData?: { category?: string; imageIndex?: number }
  // ) {
  //   // This endpoint remains for single-image deletion if needed elsewhere,
  //   // but our new logic will use the batch endpoint below.
  //   try {
  //     this.logger.log(`🗑️ Deleting image ${imageId} from assortment: ${assortmentId}`);
  //     // ... (existing implementation)
  //   } catch (error) {
  //     // ... (existing implementation)
  //   }
  // }

  // ADDED: New endpoint to handle deleting multiple images at once.
  @Delete('assortment/:assortmentId/images/batch')
  async deleteBatchImages(
    @Param('assortmentId') assortmentId: string,
    @Body() payload: { imageIds: string[] },
  ) {
    const startTime = Date.now();
    
    try {
      this.logger.log(`🗑️ Batch deleting ${payload.imageIds?.length || 0} images from ${assortmentId}`);
      
      const result = await this.webhookService.deleteMultipleImages(
        assortmentId,
        payload.imageIds,
      );

      const duration = Date.now() - startTime;
      this.logger.log(`✅ Batch delete completed in ${duration}ms - ${result.deletedCount} images deleted`);

      if (!result.success) {
        return {
          success: false,
          message: result.message,
          assortmentId,
          duration
        };
      }

      return {
        success: true,
        message: 'Images deleted successfully',
        assortmentId,
        deletedCount: result.deletedCount,
        data: result.updatedAssortment,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ Batch delete failed after ${duration}ms:`, error.message);
      return {
        success: false,
        error: 'Image batch deletion failed',
        message: error.message,
        assortmentId,
        duration
      };
    }
  }

  // Keep existing sales order webhook endpoint
  @Post('packing-instruction/:orderName')
  async handleSalesOrderWebhook(
    @Param('orderName') orderName: string,
    @Body() webhookData: OdooWebhookPayload,
  ) {
    try {
      if (orderName.startsWith('A') && webhookData.assortments?.length === 1) {
        this.logger.log(`Redirecting individual assortment to proper endpoint: ${orderName}`);
        return {
          success: false,
          error: 'Wrong endpoint for individual assortment',
          message: `Use POST /webhook/individual-assortment/${orderName} for individual assortments`,
          redirectTo: `/webhook/individual-assortment/${orderName}`
        };
      }

      this.logger.log(`Received sales order webhook: ${orderName}`);
      
      const stats = {
        orderName,
        customer: webhookData.salesOrder?.customer || 'Unknown',
        assortmentCount: webhookData.assortments?.length || 0,
        totalImages: this.countTotalImages(webhookData.assortments || [])
      };
      
      this.logger.log(`Sales order webhook stats:`, JSON.stringify(stats, null, 2));

      const savedData = await this.webhookService.saveWebhookData(orderName, webhookData);
      this.logger.log(`Saved sales order webhook data with ID: ${savedData._id}`);

      await this.webhookService.markAsProcessed(orderName);

      return {
        success: true,
        message: 'Sales order webhook data saved successfully',
        orderName,
        dataId: savedData._id,
        totalImages: stats.totalImages,
        frontendUrl: `${this.getFrontendUrl()}/packing-instruction/${orderName}`
      };
      
    } catch (error) {
      this.logger.error(`Sales order webhook error for ${orderName}:`, error);
      
      return {
        success: false,
        error: 'Sales order webhook processing failed',
        message: error.message,
        orderName
      };
    }
  }

  // Add this to your webhook.controller.ts

  @Get('pcf-images/:filename')
  async serveUploadedImage(
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    try {
      this.logger.log(`📁 Serving uploaded image: ${filename}`);
      
      // Find the image in any assortment's user modifications
      const assortment = await this.webhookService.findImageByFilename(filename);
      
      if (!assortment || !assortment.imageBuffer) {
        this.logger.warn(`❌ Image not found: ${filename}`);
        return res.status(404).json({
          success: false,
          message: `Image ${filename} not found`
        });
      }

      // Set appropriate headers
      res.set({
        'Content-Type': assortment.mimetype || 'application/octet-stream',
        'Content-Length': assortment.size || assortment.imageBuffer.length,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      });

      // Send the image buffer
      return res.send(assortment.imageBuffer);

    } catch (error) {
      this.logger.error(`❌ Failed to serve image ${filename}:`, error);
      return res.status(500).json({
        success: false,
        error: 'Failed to serve image',
        message: error.message
      });
    }
  }

  // ENHANCED: Individual assortment webhook with persistent storage
  @Post('individual-assortment/:assortmentId')
  async handleIndividualAssortmentWebhook(
    @Param('assortmentId') assortmentId: string,
    @Body() webhookData: IndividualAssortmentPayload,
  ) {
    try {
      this.logger.log(`🚀 Received individual assortment webhook with persistent storage: ${assortmentId}`);
      
      if (!webhookData.assortment) {
        throw new Error('Missing assortment data in webhook payload');
      }

      const assortment = webhookData.assortment;
      
      if (assortment.itemNo !== assortmentId) {
        this.logger.warn(`Assortment ID mismatch: URL has ${assortmentId}, data has ${assortment.itemNo}`);
      }

      // Save with enhanced persistent storage
      const savedData = await this.webhookService.saveIndividualAssortment(assortment);
      
      this.logger.log(`💾 Saved individual assortment with persistent storage: ${assortmentId} (v${savedData.currentVersion})`);

      const stats = {
        assortmentId,
        itemNo: assortment.itemNo,
        name: assortment.name,
        totalImages: this.countTotalImages([assortment]),
        version: savedData.currentVersion,
        cacheKey: savedData.cacheKey,
        persistentStorageEnabled: true
      };

      return {
        success: true,
        message: 'Individual assortment saved with persistent storage',
        assortmentId,
        itemNo: assortment.itemNo,
        dataId: savedData._id,
        version: savedData.currentVersion,
        cacheKey: savedData.cacheKey,
        totalImages: stats.totalImages,
        persistentStorageEnabled: true,
        frontendUrl: `${this.getFrontendUrl()}/packing-instruction/${assortmentId}`
      };

    } catch (error) {
      this.logger.error(`❌ Individual assortment webhook error for ${assortmentId}:`, error);
      
      return {
        success: false,
        error: 'Individual assortment processing failed',
        message: error.message,
        assortmentId
      };
    }
  }

  // ENHANCED: Get assortment with cache validation
  @Get('assortment/:assortmentId')
  async getAssortmentData(
    @Param('assortmentId') assortmentId: string,
    @Query('expectedHash') expectedHash?: string,
    @Query('validateCache') validateCache?: string
  ) {
    try {
      console.log(`🔍 Getting enhanced assortment data for: ${assortmentId}`);
      
      // Check if cache validation was requested
      if (validateCache === 'true' && expectedHash) {
        const cacheValidation = await this.webhookService.getIndividualAssortmentWithCacheValidation(
          assortmentId,
          expectedHash
        );
        
        if (cacheValidation.data && cacheValidation.cacheValid) {
          console.log(`✅ Cache validation passed for: ${assortmentId}`);
          return {
            success: true,
            data: cacheValidation.data,
            source: 'individual',
            cacheValid: true,
            version: cacheValidation.version,
            assortmentId
          };
        } else if (cacheValidation.data && !cacheValidation.cacheValid) {
          console.log(`⚠️ Cache validation failed for: ${assortmentId}, data may be stale`);
          return {
            success: true,
            data: cacheValidation.data,
            source: 'individual',
            cacheValid: false,
            version: cacheValidation.version,
            warning: 'Cache may be stale, consider refreshing',
            assortmentId
          };
        }
      }

      // Try to get from individual assortment collection first
      const individualData = await this.webhookService.getIndividualAssortmentData(assortmentId);
      
      if (individualData) {
        console.log(`✅ Found individual assortment data for: ${assortmentId}`);
        return {
          success: true,
          data: individualData,
          source: 'individual',
          cacheValid: true,
          persistentStorageEnabled: true,
          assortmentId
        };
      }

      // Fallback to sales order data
      let searchCriteria: any;
      
      if (assortmentId.startsWith('A')) {
        searchCriteria = { 'assortments.itemNo': assortmentId };
        console.log(`🔍 Searching by itemNo: ${assortmentId}`);
      } else {
        const assortmentIdNumber = parseInt(assortmentId, 10);
        if (!isNaN(assortmentIdNumber)) {
          searchCriteria = { 'assortments._id': assortmentIdNumber };
          console.log(`🔍 Searching by _id: ${assortmentIdNumber}`);
        } else {
          console.log(`❌ Invalid assortment ID format: ${assortmentId}`);
          return {
            success: false,
            message: `Invalid assortment ID format: ${assortmentId}`,
            assortmentId
          };
        }
      }

      const salesOrderData = await this.webhookService.getAssortmentFromSalesOrder(searchCriteria, assortmentId);
      
      if (salesOrderData) {
        console.log(`✅ Found assortment in sales order data: ${assortmentId}`);
        return {
          success: true,
          data: salesOrderData,
          source: 'sales_order',
          cacheValid: false,
          persistentStorageEnabled: false,
          assortmentId
        };
      }

      console.log(`❌ Assortment not found: ${assortmentId}`);
      return {
        success: false,
        message: `No assortment data found for ID: ${assortmentId}`,
        assortmentId
      };
    } catch (error) {
      this.logger.error(`Failed to get assortment data for ${assortmentId}:`, error);
      
      return {
        success: false,
        error: 'Failed to retrieve assortment data',
        message: error.message,
        assortmentId
      };
    }
  }

  // NEW: Cache management endpoints
  @Delete('cache/:assortmentId')
  async invalidateAssortmentCache(@Param('assortmentId') assortmentId: string) {
    try {
      this.logger.log(`🗑️ Invalidating cache for assortment: ${assortmentId}`);
      
      const success = await this.webhookService.invalidateAssortmentCache(assortmentId);
      
      return {
        success,
        message: success ? 
          `Cache invalidated for assortment ${assortmentId}` :
          `Failed to invalidate cache for assortment ${assortmentId}`,
        assortmentId
      };
    } catch (error) {
      this.logger.error(`Failed to invalidate cache for ${assortmentId}:`, error);
      return {
        success: false,
        error: 'Cache invalidation failed',
        message: error.message,
        assortmentId
      };
    }
  }

  @Delete('cache')
  async cleanupOldCacheEntries(@Query('olderThanDays') olderThanDays?: string) {
    try {
      const days = olderThanDays ? parseInt(olderThanDays, 10) : 30;
      this.logger.log(`🧹 Cleaning up cache entries older than ${days} days`);
      
      const deletedCount = await this.webhookService.cleanupOldCacheEntries(days);
      
      return {
        success: true,
        message: `Cleaned up ${deletedCount} old cache entries`,
        deletedCount,
        olderThanDays: days
      };
    } catch (error) {
      this.logger.error('Failed to cleanup old cache entries:', error);
      return {
        success: false,
        error: 'Cache cleanup failed',
        message: error.message
      };
    }
  }

  @Get('cache/stats')
  async getCacheStatistics() {
    try {
      const stats = await this.webhookService.getCacheStatistics();
      
      return {
        success: true,
        cacheStatistics: stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Failed to get cache statistics:', error);
      return {
        success: false,
        error: 'Failed to retrieve cache statistics',
        message: error.message
      };
    }
  }

  // Enhanced stats endpoint
  @Get('stats')
  async getWebhookStats() {
    try {
      const stats = await this.webhookService.getWebhookStats();
      return {
        success: true,
        stats
      };
    } catch (error) {
      this.logger.error('Failed to get webhook stats:', error);
      return {
        success: false,
        error: 'Failed to retrieve webhook statistics',
        message: error.message
      };
    }
  }

  // Keep all your existing endpoints...
  @Get('data/:orderName')
  async getWebhookData(@Param('orderName') orderName: string) {
    try {
      const data = await this.webhookService.getWebhookData(orderName);
      
      if (!data) {
        return {
          success: false,
          message: `No webhook data found for order: ${orderName}`,
          orderName
        };
      }

      return {
        success: true,
        data,
        orderName
      };
    } catch (error) {
      this.logger.error(`Failed to get webhook data for ${orderName}:`, error);
      
      return {
        success: false,
        error: 'Failed to retrieve webhook data',
        message: error.message,
        orderName
      };
    }
  }

  @Get('recent/:limit?')
  async getRecentWebhooks(@Param('limit') limit?: string) {
    try {
      const limitNumber = limit ? parseInt(limit, 10) : 50;
      const webhooks = await this.webhookService.getRecentWebhooks(limitNumber);
      
      return {
        success: true,
        count: webhooks.length,
        webhooks: webhooks.map(webhook => ({
          orderName: webhook.orderName,
          customer: webhook.salesOrder.customer,
          assortmentCount: webhook.assortments.length,
          totalImages: webhook.metadata?.totalImages || 0,
          status: webhook.status,
          receivedAt: webhook.receivedAt,
          processedAt: webhook.processedAt
        }))
      };
    } catch (error) {
      this.logger.error('Failed to get recent webhooks:', error);
      return {
        success: false,
        error: 'Failed to retrieve recent webhooks',
        message: error.message
      };
    }
  }

  @Post('test')
  async testWebhook(@Body() data: any) {
    this.logger.log('Test webhook received:', data);
    
    return { 
      success: true,
      message: 'Enhanced webhook endpoint is working!', 
      receivedData: data,
      timestamp: new Date().toISOString(),
      backendPort: 5006,
      environment: process.env.NODE_ENV,
      persistentStorageEnabled: true
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'healthy',
      service: 'enhanced-webhook-controller',
      port: 5006,
      timestamp: new Date().toISOString(),
      database: 'connected',
      persistentStorageEnabled: true,
      cacheManagement: 'enabled'
    };
  }

  @Get('debug/assortment/:assortmentId')
  async debugAssortment(@Param('assortmentId') assortmentId: string) {
    try {
      const data = await this.webhookService.getIndividualAssortmentData(assortmentId);
      
      if (!data) {
        return {
          success: false,
          message: `No data found for ${assortmentId}`
        };
      }

      const userMods = data.userModifications || {};
      
      return {
        success: true,
        assortmentId,
        debug: {
          hasUserModifications: !!userMods.uploadedImages || !!userMods.imageLabels,
          uploadedImageCounts: userMods.uploadedImages ? {
            itemPack: userMods.uploadedImages.itemPackImages?.length || 0,
            barcode: userMods.uploadedImages.itemBarcodeImages?.length || 0,
            display: userMods.uploadedImages.displayImages?.length || 0,
            innerCarton: userMods.uploadedImages.innerCartonImages?.length || 0,
            masterCarton: userMods.uploadedImages.masterCartonImages?.length || 0
          } : 'No uploaded images',
          imageLabels: Object.keys(userMods.imageLabels || {}).length,
          lastModified: userMods.lastModified,
          version: data._version || 'Unknown'
        },
        rawUserModifications: userMods
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        assortmentId
      };
    }
  }

  private processUploadedFiles(files: Express.Multer.File[], imageLabels: any, fileMapping?: Record<string, string>) {
    const processedImages = {
      itemPackImages: [],
      itemBarcodeImages: [],
      displayImages: [],
      innerCartonImages: [],
      masterCartonImages: [],
      // ✅ NEW: Add shipping mark arrays
      innerCartonShippingMarks: [],
      masterCartonMainShippingMarks: [],
      masterCartonSideShippingMarks: [],
    };

    if (!files || files.length === 0) {
      this.logger.log('No files to process');
      return processedImages;
    }

    files.forEach((file, index) => {
      let category = 'displayImages'; // Default category
      
      if (fileMapping && fileMapping[index.toString()]) {
        category = fileMapping[index.toString()];
      }
      
      const fileData = {
        originalname: file.originalname,
        filename: file.filename || `${Date.now()}-${index}-${file.originalname}`,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
        uploadedAt: new Date().toISOString()
      };

      // ✅ CRITICAL FIX: Check if this file is a shipping mark
      const label = imageLabels[file.originalname];
      const isShippingMark = label && label.includes('shipping_mark');
      
      if (isShippingMark) {
        // ✅ Route shipping marks to separate arrays
        if (label === 'inner_shipping_mark') {
          processedImages.innerCartonShippingMarks.push(fileData);
          this.logger.log(`🚚 Processed inner shipping mark: ${file.originalname}`);
        } else if (label === 'main_shipping_mark') {
          processedImages.masterCartonMainShippingMarks.push(fileData);
          this.logger.log(`🚚 Processed main shipping mark: ${file.originalname}`);
        } else if (label === 'side_shipping_mark') {
          processedImages.masterCartonSideShippingMarks.push(fileData);
          this.logger.log(`🚚 Processed side shipping mark: ${file.originalname}`);
        }
      } else {
        // ✅ Regular images go to normal categories
        if (processedImages[category as keyof typeof processedImages]) {
          processedImages[category as keyof typeof processedImages].push(fileData);
        }
      }
    });

    this.logger.log(`📊 Processed images:`, {
      itemPack: processedImages.itemPackImages.length,
      barcode: processedImages.itemBarcodeImages.length,
      display: processedImages.displayImages.length,
      innerCarton: processedImages.innerCartonImages.length,
      masterCarton: processedImages.masterCartonImages.length,
      // ✅ NEW: Log shipping marks
      innerShippingMarks: processedImages.innerCartonShippingMarks.length,
      mainShippingMarks: processedImages.masterCartonMainShippingMarks.length,
      sideShippingMarks: processedImages.masterCartonSideShippingMarks.length,
    });

    return processedImages;
  }

  // Helper methods
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

  private getFrontendUrl(): string {
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    if (nodeEnv === 'production') {
      return process.env.FRONTEND_URL || 'https://your-production-url.com';
    }
    
    const frontendPort = process.env.FRONTEND_PORT || '5138';
    return `http://localhost:${frontendPort}`;
  }
  @Get('test-service-injection')
  testServiceInjection() {
    console.log('Service injected:', !!this.webhookService);
    console.log('Service methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.webhookService)));
    return {
      serviceInjected: !!this.webhookService,
      availableMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(this.webhookService))
    };
  }
}
