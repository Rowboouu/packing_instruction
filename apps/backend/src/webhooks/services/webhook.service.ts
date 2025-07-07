import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookData } from '../schemas/webhook-data.schema';

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
    pcfImages: {
      itemPackImages: Array<Array<{
        id: number;
        componentName: string;
        image: string;
        filename: string;
      }>>;
      itemBarcodeImages: Array<{
        id: number;
        componentName: string;
        image: string;
        filename: string;
      }>;
      displayImages: Array<{
        id: number;
        componentName: string;
        image: string;
        filename: string;
      }>;
      innerCartonImages: Array<{
        id: number;
        componentName: string;
        image: string;
        filename: string;
      }>;
      masterCartonImages: Array<{
        id: number;
        componentName: string;
        image: string;
        filename: string;
      }>;
    };
  }>;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectModel(WebhookData.name)
    private readonly webhookDataModel: Model<WebhookData>,
  ) {}

  async saveWebhookData(orderName: string, payload: OdooWebhookPayload): Promise<WebhookData> {
    try {
      const metadata = {
        totalImages: this.countTotalImages(payload.assortments),
        assortmentCount: payload.assortments.length,
        source: 'odoo',
        odooVersion: '17'
      };

      // Check if webhook data already exists for this order
      const existingData = await this.webhookDataModel.findOne({ orderName });

      if (existingData) {
        // Update existing record
        this.logger.log(`Updating existing webhook data for order: ${orderName}`);
        
        const updatedData = await this.webhookDataModel.findOneAndUpdate(
          { orderName },
          {
            salesOrder: payload.salesOrder,
            assortments: payload.assortments,
            status: 'received',
            receivedAt: new Date(),
            metadata,
            $unset: { errorMessage: 1 } // Clear any previous error
          },
          { new: true, upsert: false }
        );

        return updatedData;
      } else {
        // Create new record
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
      
      // Try to save error information
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

      // Find the specific assortment
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
        .find()
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

  // Helper method to get webhook statistics
  async getWebhookStats(): Promise<any> {
    try {
      const total = await this.webhookDataModel.countDocuments();
      const recent = await this.webhookDataModel.countDocuments({
        receivedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });
      const errors = await this.webhookDataModel.countDocuments({ status: 'error' });

      return {
        total,
        recent24h: recent,
        errors,
        successRate: total > 0 ? ((total - errors) / total * 100).toFixed(2) + '%' : '0%'
      };
    } catch (error) {
      this.logger.error('Failed to get webhook stats:', error);
      return { total: 0, recent24h: 0, errors: 0, successRate: '0%' };
    }
  }
}