import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AccountSignatureDocument = HydratedDocument<AccountSignature>;

@Schema({ timestamps: true, toJSON: { virtuals: true, versionKey: false } })
export class AccountSignature {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  position: string;

  @Prop({ type: Number, required: true })
  ext: number;

  @Prop()
  skype?: string;
}

export const AccountSignatureSchema =
  SchemaFactory.createForClass(AccountSignature);
