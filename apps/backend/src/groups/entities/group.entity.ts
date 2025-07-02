import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<Group>;

@Schema({ timestamps: true, toJSON: { virtuals: true, versionKey: false } })
export class Group {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ type: Object }] })
  customers: Record<string, any>[]; // Array of customer objects
}

export const GroupSchema = SchemaFactory.createForClass(Group);
