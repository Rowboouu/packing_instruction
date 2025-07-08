// src/schemas/individual-assortment.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Self-contained schema for individual assortments (no dependency on webhook-data.schema)
@Schema({ _id: false })
export class IndividualAssortmentImage {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  componentName: string;

  @Prop({ required: true })
  image: string; // Base64 encoded

  @Prop({ required: true })
  filename: string;
}

const IndividualAssortmentImageSchema = SchemaFactory.createForClass(IndividualAssortmentImage);

@Schema({ _id: false })
export class IndividualAssortmentPcfImages {
  @Prop({ type: [[IndividualAssortmentImageSchema]], default: [] })
  itemPackImages: IndividualAssortmentImage[][];

  @Prop({ type: [IndividualAssortmentImageSchema], default: [] })
  itemBarcodeImages: IndividualAssortmentImage[];

  @Prop({ type: [IndividualAssortmentImageSchema], default: [] })
  displayImages: IndividualAssortmentImage[];

  @Prop({ type: [IndividualAssortmentImageSchema], default: [] })
  innerCartonImages: IndividualAssortmentImage[];

  @Prop({ type: [IndividualAssortmentImageSchema], default: [] })
  masterCartonImages: IndividualAssortmentImage[];
}

const IndividualAssortmentPcfImagesSchema = SchemaFactory.createForClass(IndividualAssortmentPcfImages);

@Schema({ _id: false })
export class IndividualAssortmentData {
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

  @Prop({ type: IndividualAssortmentPcfImagesSchema, required: true })
  pcfImages: IndividualAssortmentPcfImages;
}

const IndividualAssortmentDataSchema = SchemaFactory.createForClass(IndividualAssortmentData);

@Schema({ 
  timestamps: true,
  collection: 'individual_assortments' 
})
export class IndividualAssortment extends Document {
  @Prop({ required: true, unique: true })
  assortmentId: string; // The itemNo (e.g., "A000404")

  @Prop({ type: IndividualAssortmentDataSchema, required: true })
  assortmentData: IndividualAssortmentData;

  @Prop({ required: false })
  sourceOrderName?: string; // Optional: if it came from a sales order

  @Prop({ default: 'received' })
  status: 'received' | 'processed' | 'error';

  @Prop({ default: Date.now })
  receivedAt: Date;

  @Prop()
  processedAt: Date;

  @Prop()
  errorMessage: string;

  @Prop({ default: 0 })
  accessCount: number;

  @Prop()
  lastAccessedAt: Date;

  @Prop({ type: Object })
  metadata: {
    totalImages?: number;
    source?: 'individual_webhook' | 'sales_order_extraction';
    odooVersion?: string;
    originalId?: number;
  };
}

export const IndividualAssortmentSchema = SchemaFactory.createForClass(IndividualAssortment);

// Add indexes for better query performance
IndividualAssortmentSchema.index({ assortmentId: 1 });
IndividualAssortmentSchema.index({ status: 1 });
IndividualAssortmentSchema.index({ receivedAt: -1 });