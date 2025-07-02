import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FileData, FileDocument } from 'src/files/entities/file.entity';

export type PcfImageDocument = HydratedDocument<PcfImage>;

@Schema({ timestamps: true, toJSON: { virtuals: true, versionKey: false } })
export class PcfImage {
  @Prop({ required: true })
  field: string;

  @Prop({ type: Boolean, default: true })
  isApproved: boolean;

  @Prop({ type: Number, default: 0 })
  sequence: number;

  @Prop({ type: Types.ObjectId, ref: FileData.name })
  fileData: FileDocument;

  @Prop({ type: Types.ObjectId, ref: 'zuluassortments' })
  itemId: string;

  @Prop({ type: [String], default: [] })
  barcodeErrors: string[];
}

export const PcfImageSchema = SchemaFactory.createForClass(PcfImage);
