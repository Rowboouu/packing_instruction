import { Controller, Post, Get, Param, Body, Res, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { WebhookService, OdooWebhookPayload } from '../services/webhook.service';

@Controller('webhook') // Remove 'webhook' prefix
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post('packing-instruction/:orderName')
  async handlePackingInstructionWebhook(
    @Param('orderName') orderName: string,
    @Body() webhookData: OdooWebhookPayload,
  ) {
    try {
      this.logger.log(`Received webhook for order: ${orderName}`);
      
      // Log basic statistics
      const stats = {
        orderName,
        customer: webhookData.salesOrder?.customer || 'Unknown',
        assortmentCount: webhookData.assortments?.length || 0,
        totalImages: this.countTotalImages(webhookData.assortments || [])
      };
      
      this.logger.log(`Webhook stats:`, JSON.stringify(stats, null, 2));

      // Save webhook data to database
      const savedData = await this.webhookService.saveWebhookData(orderName, webhookData);
      this.logger.log(`Saved webhook data with ID: ${savedData._id}`);

      // Mark as processed
      await this.webhookService.markAsProcessed(orderName);

      // Return success response (no redirect)
      return {
        success: true,
        message: 'Webhook data saved successfully',
        orderName,
        dataId: savedData._id,
        totalImages: stats.totalImages,
        frontendUrl: `${this.getFrontendUrl()}/packing-instruction/${orderName}`
      };
      
    } catch (error) {
      this.logger.error(`Webhook error for ${orderName}:`, error);
      
      return {
        success: false,
        error: 'Webhook processing failed',
        message: error.message,
        orderName
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
      const assortmentIdNumber = parseInt(assortmentId, 10);
      
      if (isNaN(assortmentIdNumber)) {
        return {
          success: false,
          message: 'Invalid assortment ID format',
          assortmentId
        };
      }

      const data = await this.webhookService.getAssortmentData(assortmentIdNumber);
      
      if (!data) {
        return {
          success: false,
          message: `No assortment data found for ID: ${assortmentId}`,
          assortmentId
        };
      }

      return {
        success: true,
        data,
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