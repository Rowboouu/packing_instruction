import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Template } from 'src/templates/entities/template.entity';
import { string } from 'zod';

export type CustomerTemplateDocument = HydratedDocument<CustomerTemplate>;

@Schema({ timestamps: true, toJSON: { virtuals: true, versionKey: false } })
export class CustomerTemplate {
  @Prop({ type: Number, required: true, unique: true })
  customerId: number;

  @Prop({ type: string, required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: Template.name, required: true })
  template: Template;
}

export const CustomerTemplateSchema =
  SchemaFactory.createForClass(CustomerTemplate);
