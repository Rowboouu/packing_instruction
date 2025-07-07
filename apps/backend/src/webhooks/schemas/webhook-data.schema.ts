import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Schema for individual Odoo images
@Schema({ _id: false })
export class OdooImage {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  componentName: string;

  @Prop({ required: true })
  image: string; // Base64 encoded

  @Prop({ required: true })
  filename: string;
}

const OdooImageSchema = SchemaFactory.createForClass(OdooImage);

// Schema for PCF Images structure
@Schema({ _id: false })
export class OdooPcfImages {
  @Prop({ type: [[OdooImageSchema]], default: [] })
  itemPackImages: OdooImage[][];

  @Prop({ type: [OdooImageSchema], default: [] })
  itemBarcodeImages: OdooImage[];

  @Prop({ type: [OdooImageSchema], default: [] })
  displayImages: OdooImage[];

  @Prop({ type: [OdooImageSchema], default: [] })
  innerCartonImages: OdooImage[];

  @Prop({ type: [OdooImageSchema], default: [] })
  masterCartonImages: OdooImage[];
}

const OdooPcfImagesSchema = SchemaFactory.createForClass(OdooPcfImages);

// Schema for Sales Order info
@Schema({ _id: false })
export class OdooSalesOrder {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  customer: string;

  @Prop({ required: true })
  customer_po: string;
}

const OdooSalesOrderSchema = SchemaFactory.createForClass(OdooSalesOrder);

// Schema for individual assortment
@Schema({ _id: false })
export class OdooAssortment {
  @Prop({ required: true })
  _id: number;

  @Prop({ required: true })
  customerItemNo: string;

  @Prop({ required: true })
  itemNo: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  orderId: number;

  @Prop({ required: true })
  productId: number;

  @Prop({ required: true })
  length_cm: number;

  @Prop({ required: true })
  width_cm: number;

  @Prop({ required: true })
  height_cm: number;

  @Prop({ required: true })
  master_carton_length_cm: number;

  @Prop({ required: true })
  master_carton_width_cm: number;

  @Prop({ required: true })
  master_carton_height_cm: number;

  @Prop({ required: true })
  inner_carton_length_cm: number;

  @Prop({ required: true })
  inner_carton_width_cm: number;

  @Prop({ required: true })
  inner_carton_height_cm: number;

  @Prop({ type: OdooPcfImagesSchema, required: true })
  pcfImages: OdooPcfImages;
}

const OdooAssortmentSchema = SchemaFactory.createForClass(OdooAssortment);

// Main webhook data schema
@Schema({ 
  timestamps: true,
  collection: 'webhook_data' 
})
export class WebhookData extends Document {
  @Prop({ required: true, unique: true })
  orderName: string;

  @Prop({ type: OdooSalesOrderSchema, required: true })
  salesOrder: OdooSalesOrder;

  @Prop({ type: [OdooAssortmentSchema], required: true })
  assortments: OdooAssortment[];

  @Prop({ default: 'received' })
  status: 'received' | 'processed' | 'error';

  @Prop({ default: Date.now })
  receivedAt: Date;

  @Prop()
  processedAt: Date;

  @Prop()
  errorMessage: string;

  @Prop({ type: Object })
  metadata: {
    totalImages?: number;
    assortmentCount?: number;
    source?: string;
    odooVersion?: string;
  };
}

export const WebhookDataSchema = SchemaFactory.createForClass(WebhookData);

// Add indexes for better query performance
WebhookDataSchema.index({ orderName: 1 });
WebhookDataSchema.index({ 'salesOrder.id': 1 });
WebhookDataSchema.index({ 'assortments._id': 1 });
WebhookDataSchema.index({ status: 1 });
WebhookDataSchema.index({ receivedAt: -1 });