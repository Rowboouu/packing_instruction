import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ZuluAssortment } from 'src/zulu-assortments/entities/zulu-assortment.entity';

export type ZuluSalesOrderDocument = HydratedDocument<ZuluSalesOrder>;
@Schema({ timestamps: true, toJSON: { virtuals: true, versionKey: false } })
export class ZuluSalesOrder {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Number, required: true, unique: true })
  orderId: number;

  @Prop({})
  customerPoNo: string;

  @Prop({ type: Number, required: true })
  partnerId: number;

  @Prop({ type: [Number], default: [] })
  orderLines: number[];

  @Prop({ type: Date, default: null })
  etd?: Date | null;

  @Prop({ type: String, default: 'todo' })
  status: string;

  @Prop({ type: String, default: 'sale' })
  state: string;

  @Prop({ type: [Types.ObjectId], ref: ZuluAssortment.name, default: [] })
  orderItems: ZuluAssortment[];
}

export const ZuluSalesOrderSchema =
  SchemaFactory.createForClass(ZuluSalesOrder);
