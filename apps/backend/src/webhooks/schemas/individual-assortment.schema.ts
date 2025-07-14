// src/schemas/individual-assortment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Enhanced image schema with hashing and versioning
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

  // NEW: Add image hash for change detection
  @Prop({ required: true })
  imageHash: string; // SHA-256 hash of base64 content

  // NEW: Add image metadata
  @Prop()
  imageSize?: number; // Size in bytes for optimization

  @Prop()
  imageMimeType?: string; // Detected MIME type

  @Prop({ default: Date.now })
  lastUpdated: Date;
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

  // NEW: Add overall image collection metadata
  @Prop()
  totalImageCount?: number;

  @Prop()
  lastImageUpdate?: Date;

  @Prop()
  imageCollectionHash?: string; // Hash of all image hashes combined
}

const IndividualAssortmentPcfImagesSchema = SchemaFactory.createForClass(IndividualAssortmentPcfImages);

// NEW: User uploaded file schema
@Schema({ _id: false })
export class UserUploadedFile {
  @Prop({ required: true })
  originalname: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  uploadedAt: string;

  @Prop()
  buffer?: Buffer; // Store file data if needed
}

const UserUploadedFileSchema = SchemaFactory.createForClass(UserUploadedFile);

// NEW: User uploaded images by category
@Schema({ _id: false })
export class UserUploadedImages {
  @Prop({ type: [UserUploadedFileSchema], default: [] })
  itemPackImages: UserUploadedFile[];

  @Prop({ type: [UserUploadedFileSchema], default: [] })
  itemBarcodeImages: UserUploadedFile[];

  @Prop({ type: [UserUploadedFileSchema], default: [] })
  displayImages: UserUploadedFile[];

  @Prop({ type: [UserUploadedFileSchema], default: [] })
  innerCartonImages: UserUploadedFile[];

  @Prop({ type: [UserUploadedFileSchema], default: [] })
  masterCartonImages: UserUploadedFile[];

  @Prop({ type: [UserUploadedFileSchema], default: [] })
  innerCartonShippingMarks: UserUploadedFile[];

  @Prop({ type: [UserUploadedFileSchema], default: [] })
  masterCartonMainShippingMarks: UserUploadedFile[];

  @Prop({ type: [UserUploadedFileSchema], default: [] })
  masterCartonSideShippingMarks: UserUploadedFile[];
}

const UserUploadedImagesSchema = SchemaFactory.createForClass(UserUploadedImages);

// NEW: User modifications schema
@Schema({ _id: false })
export class UserModifications {
  @Prop({ type: UserUploadedImagesSchema })
  uploadedImages?: UserUploadedImages;

  @Prop({ type: Object, default: {} })
  imageLabels: Record<string, string>;

  @Prop()
  lastModified?: Date;

  @Prop({ type: Object, default: {} })
  customFields?: Record<string, any>;

  @Prop({ type: Object })
  formData?: {
    productInCarton?: number;
    productPerUnit?: number;
    masterCUFT?: number;
    masterGrossWeight?: number;
    unit?: string;
    cubicUnit?: string;
    wtUnit?: string;
  };
}

const UserModificationsSchema = SchemaFactory.createForClass(UserModifications);

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

  // NEW: Add user modifications field
  @Prop({ type: UserModificationsSchema })
  userModifications?: UserModifications;
}

const IndividualAssortmentDataSchema = SchemaFactory.createForClass(IndividualAssortmentData);

// NEW: Image version history for tracking changes
@Schema({ _id: false })
export class ImageVersionHistory {
  @Prop({ required: true })
  version: number;

  @Prop({ required: true })
  imageCollectionHash: string;

  @Prop({ required: true })
  receivedAt: Date;

  @Prop()
  changedImages?: string[]; // Array of componentNames that changed

  @Prop()
  totalImages?: number;
}

const ImageVersionHistorySchema = SchemaFactory.createForClass(ImageVersionHistory);

@Schema({ 
  timestamps: true,
  collection: 'individual_assortments' 
})
export class IndividualAssortment extends Document {
  @Prop({ required: true, unique: true, index: true })
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

  // NEW: Version management
  @Prop({ default: 1 })
  currentVersion: number;

  @Prop({ type: [ImageVersionHistorySchema], default: [] })
  versionHistory: ImageVersionHistory[];

  // NEW: Cache management
  @Prop()
  cacheKey?: string; // For React Query cache invalidation

  @Prop({ default: Date.now })
  lastCacheUpdate: Date;

  // NEW: Enhanced metadata
  @Prop({ type: Object })
  metadata: {
    totalImages?: number;
    source?: 'individual_webhook' | 'sales_order_extraction';
    odooVersion?: string;
    originalId?: number;
    // NEW: Add more metadata
    imageCollectionHash?: string;
    lastImageUpdate?: Date;
    persistentStorageEnabled?: boolean;
    cachingStrategy?: 'aggressive' | 'conservative' | 'minimal';
    hasUserModifications?: boolean; // NEW: Track if user has made changes
  };

  // NEW: Performance tracking
  @Prop({ type: Object })
  performanceMetrics?: {
    averageLoadTime?: number;
    cacheHitRate?: number;
    lastPerformanceCheck?: Date;
    totalCacheHits?: number;
    totalCacheMisses?: number;
  };
}

export const IndividualAssortmentSchema = SchemaFactory.createForClass(IndividualAssortment);

// Enhanced indexes for better query performance
IndividualAssortmentSchema.index({ assortmentId: 1 });
IndividualAssortmentSchema.index({ status: 1 });
IndividualAssortmentSchema.index({ receivedAt: -1 });
IndividualAssortmentSchema.index({ currentVersion: 1 });
IndividualAssortmentSchema.index({ 'metadata.imageCollectionHash': 1 });
IndividualAssortmentSchema.index({ lastCacheUpdate: -1 });
IndividualAssortmentSchema.index({ cacheKey: 1 });
IndividualAssortmentSchema.index({ 'metadata.hasUserModifications': 1 }); // NEW: Index for user modifications