import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ZuluCustomerDocument = HydratedDocument<ZuluCustomer>;

@Schema({ timestamps: true, toJSON: { virtuals: true, versionKey: false } })
export class ZuluCustomer {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Number, required: true, unique: true })
  partnerId: number;
}

export const ZuluCustomerSchema = SchemaFactory.createForClass(ZuluCustomer);
