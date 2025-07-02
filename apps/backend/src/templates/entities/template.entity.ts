import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FileData, FileDocument } from 'src/files/entities/file.entity';

export type TemplteDocument = HydratedDocument<Template>;
@Schema({ timestamps: true, toJSON: { virtuals: true, versionKey: false } })
export class Template {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: FileData.name, required: true }) // Assuming you have a File schema defined
  fileData: FileDocument;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
