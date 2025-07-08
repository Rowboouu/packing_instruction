import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookData } from '../schemas/webhook-data.schema';
import { IndividualAssortment } from '../schemas/individual-assortment.schema';

// Keep your existing interface
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

// New interface for individual assortment payload
export interface IndividualAssortmentPayload {
  assortment: any; // Single assortment object
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

  // Existing sales order webhook methods
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

  // NEW: Clean method for saving individual assortments
  async saveIndividualAssortment(assortment: any): Promise<IndividualAssortment> {
    try {
      this.logger.log(`Saving individual assortment: ${assortment.itemNo}`);

      const individualData = {
        assortmentId: assortment.itemNo,
        assortmentData: assortment,
        status: 'received',
        receivedAt: new Date(),
        accessCount: 0,
        metadata: {
          totalImages: this.countTotalImages([assortment]),
          source: 'individual_webhook',
          odooVersion: '17',
          originalId: assortment._id
        }
      };

      // Check if individual assortment already exists
      const existingIndividual = await this.individualAssortmentModel.findOne({ 
        assortmentId: assortment.itemNo 
      });

      if (existingIndividual) {
        // Update existing individual record
        this.logger.log(`Updating existing individual assortment: ${assortment.itemNo}`);
        
        const updatedData = await this.individualAssortmentModel.findOneAndUpdate(
          { assortmentId: assortment.itemNo },
          {
            ...individualData,
            accessCount: existingIndividual.accessCount + 1,
            lastAccessedAt: new Date()
          },
          { new: true, upsert: false }
        );

        this.logger.log(`Successfully updated individual assortment: ${assortment.itemNo}`);
        return updatedData;
      } else {
        // Create new individual record
        this.logger.log(`Creating new individual assortment: ${assortment.itemNo}`);
        
        const newIndividualAssortment = new this.individualAssortmentModel(individualData);
        const savedData = await newIndividualAssortment.save();
        
        this.logger.log(`Successfully created individual assortment: ${assortment.itemNo} with ID: ${savedData._id}`);
        return savedData;
      }
    } catch (error) {
      this.logger.error(`Failed to save individual assortment ${assortment.itemNo}:`, error);
      throw error;
    }
  }

  // NEW: Clean method for getting individual assortments
  async getIndividualAssortmentData(assortmentId: string): Promise<any> {
    try {
      this.logger.log(`Getting individual assortment data for: ${assortmentId}`);
      
      const individualData = await this.individualAssortmentModel.findOne({
        assortmentId: assortmentId
      }).exec();

      if (individualData) {
        this.logger.log(`✅ Found individual assortment: ${assortmentId}`);
        
        // Update access count and last accessed time
        await this.individualAssortmentModel.findOneAndUpdate(
          { assortmentId: assortmentId },
          {
            $inc: { accessCount: 1 },
            lastAccessedAt: new Date()
          }
        );

        // Return the assortment data in the format expected by the frontend
        return {
          ...individualData.assortmentData,
          // Add metadata for the frontend
          _individualAssortmentId: individualData._id,
          _accessCount: individualData.accessCount + 1,
          _lastAccessed: new Date()
        };
      }

      this.logger.log(`❌ No individual assortment found for: ${assortmentId}`);
      return null;
    } catch (error) {
      this.logger.error(`Failed to get individual assortment data for ${assortmentId}:`, error);
      return null;
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

        // Find the specific assortment within the sales order
        let assortment: any;
        
        if (assortmentId.startsWith('A')) {
        // Search by itemNo
        assortment = webhookData.assortments.find(a => a.itemNo === assortmentId);
        } else {
        // Search by _id (numeric)
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
      // Exclude individual assortments from recent webhooks list
      return await this.webhookDataModel
        .find({ 
          orderName: { $not: /^INDIVIDUAL_/ } // Exclude individual assortment records
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

  // Helper method to get webhook statistics
  async getWebhookStats(): Promise<any> {
    try {
      const total = await this.webhookDataModel.countDocuments({
        orderName: { $not: /^INDIVIDUAL_/ } // Exclude individual assortments
      });
      const recent = await this.webhookDataModel.countDocuments({
        orderName: { $not: /^INDIVIDUAL_/ },
        receivedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });
      const errors = await this.webhookDataModel.countDocuments({ 
        status: 'error',
        orderName: { $not: /^INDIVIDUAL_/ }
      });
      const individualCount = await this.individualAssortmentModel.countDocuments();

      return {
        total,
        recent24h: recent,
        errors,
        individualAssortments: individualCount,
        successRate: total > 0 ? ((total - errors) / total * 100).toFixed(2) + '%' : '0%'
      };
    } catch (error) {
      this.logger.error('Failed to get webhook stats:', error);
      return { total: 0, recent24h: 0, errors: 0, individualAssortments: 0, successRate: '0%' };
    }
  }
}