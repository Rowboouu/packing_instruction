import { Controller, Post, Get, Param, Body, Res, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { WebhookService, OdooWebhookPayload, IndividualAssortmentPayload } from '../services/webhook.service';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  // Sales order webhook endpoint
  @Post('packing-instruction/:orderName')
  async handleSalesOrderWebhook(
    @Param('orderName') orderName: string,
    @Body() webhookData: OdooWebhookPayload,
  ) {
    try {
      // Only handle sales orders (not starting with 'A' or multiple assortments)
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
      
      // Handle as sales order
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

  // NEW: Dedicated individual assortment webhook endpoint
  @Post('individual-assortment/:assortmentId')
  async handleIndividualAssortmentWebhook(
    @Param('assortmentId') assortmentId: string,
    @Body() webhookData: IndividualAssortmentPayload,
  ) {
    try {
      this.logger.log(`Received individual assortment webhook: ${assortmentId}`);
      
      if (!webhookData.assortment) {
        throw new Error('Missing assortment data in webhook payload');
      }

      const assortment = webhookData.assortment;
      
      // Validate that the assortment ID matches
      if (assortment.itemNo !== assortmentId) {
        this.logger.warn(`Assortment ID mismatch: URL has ${assortmentId}, data has ${assortment.itemNo}`);
      }

      // Save as individual assortment (no fake sales order data needed!)
      const savedData = await this.webhookService.saveIndividualAssortment(assortment);
      
      this.logger.log(`Saved individual assortment: ${assortmentId} with ID: ${savedData._id}`);

      const stats = {
        assortmentId,
        itemNo: assortment.itemNo,
        name: assortment.name,
        totalImages: this.countTotalImages([assortment])
      };

      return {
        success: true,
        message: 'Individual assortment saved successfully',
        assortmentId,
        itemNo: assortment.itemNo,
        dataId: savedData._id,
        totalImages: stats.totalImages,
        frontendUrl: `${this.getFrontendUrl()}/packing-instruction/${assortmentId}`
      };

    } catch (error) {
      this.logger.error(`Individual assortment webhook error for ${assortmentId}:`, error);
      
      return {
        success: false,
        error: 'Individual assortment processing failed',
        message: error.message,
        assortmentId
      };
    }
  }

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

  @Get('assortment/:assortmentId')
  async getAssortmentData(@Param('assortmentId') assortmentId: string) {
    try {
      console.log(`🔍 Getting assortment data for: ${assortmentId}`);
      
      // First try to get from individual assortment collection
      const individualData = await this.webhookService.getIndividualAssortmentData(assortmentId);
      
      if (individualData) {
        console.log(`✅ Found individual assortment data for: ${assortmentId}`);
        return {
          success: true,
          data: individualData,
          source: 'individual',
          assortmentId
        };
      }

      // If not found in individual collection, try to find in sales order data
      // Handle both string IDs (like "A000779") and numeric IDs
      let searchCriteria: any;
      
      if (assortmentId.startsWith('A')) {
        // Search by itemNo for string IDs like "A000779"
        searchCriteria = { 'assortments.itemNo': assortmentId };
        console.log(`🔍 Searching by itemNo: ${assortmentId}`);
      } else {
        // Try to parse as number for numeric IDs
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
  async testWebhook(@Body() data: any, @Res() res: Response) {
    this.logger.log('Test webhook received:', data);
    
    return res.json({ 
      success: true,
      message: 'Webhook endpoint is working!', 
      receivedData: data,
      timestamp: new Date().toISOString(),
      backendPort: 5006,
      environment: process.env.NODE_ENV
    });
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'healthy',
      service: 'webhook-controller',
      port: 5006,
      timestamp: new Date().toISOString(),
      database: 'connected'
    };
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
    
    // Development - try to detect the frontend port
    const frontendPort = process.env.FRONTEND_PORT || '5138'; // Default Vite port
    return `http://localhost:${frontendPort}`;
  }
}