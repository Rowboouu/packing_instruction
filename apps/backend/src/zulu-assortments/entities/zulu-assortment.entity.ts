import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FileData } from 'src/files/entities/file.entity';
import {
  PcfImage,
  PcfImageDocument,
} from 'src/pcf-images/entities/pcf-image.entity';
import { Label } from 'src/zulu-api/zulu-types';

export type ZuluAssortmentDocument = HydratedDocument<ZuluAssortment>;

@Schema({ timestamps: true, toJSON: { virtuals: true, versionKey: false } })
export class ZuluAssortment {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Number, required: true, unique: true })
  orderItemId: number;

  @Prop({ required: true })
  itemNo: string;

  @Prop({})
  customerItemNo: string;

  @Prop({ type: Number, required: true })
  orderId: number;

  @Prop({ type: Number, required: true })
  productId: number;

  @Prop({ default: 'todo' })
  status: string;

  @Prop({ default: 'pending' })
  uploadStatus: string;

  // Zulu default
  @Prop({ type: Number, default: 0 })
  productInCarton: number;

  @Prop({ type: Number, default: 0 })
  productPerUnit: number;

  @Prop({ default: '' })
  masterCUFT: string;

  @Prop({ default: '' })
  masterGrossWeight: string;

  // PCF item edited
  @Prop({ type: Number, default: 0 })
  itemInCarton: number;

  @Prop({ type: Number, default: 0 })
  itemPerUnit: number;

  @Prop({ type: Number, default: 0 })
  itemCUFT: string;

  @Prop({ type: Number, default: 0 })
  itemGrossWeight: string;

  @Prop({ default: 'PR' })
  unit?: string;

  @Prop({ default: 'cuft' })
  cubicUnit?: string;

  @Prop({ default: 'lbs' })
  wtUnit?: string;

  @Prop({ type: Types.ObjectId, ref: FileData.name })
  image?: FileData;

  @Prop({ type: [Types.ObjectId], ref: PcfImage.name, default: [] })
  pcfImages: PcfImageDocument[];

  @Prop({ type: [Object] })
  labels: Label[];
}

export const ZuluAssortmentSchema =
  SchemaFactory.createForClass(ZuluAssortment);
