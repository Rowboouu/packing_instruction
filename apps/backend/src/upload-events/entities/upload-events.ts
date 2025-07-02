import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/entities/user.entity';
import {
  ZuluAssortment,
  ZuluAssortmentDocument,
} from 'src/zulu-assortments/entities/zulu-assortment.entity';

export type UploadEventsDocument = HydratedDocument<UploadEvents>;

@Schema({ timestamps: true, toJSON: { virtuals: true, versionKey: false } })
export class UploadEvents {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: ZuluAssortment.name,
  })
  itemId: ZuluAssortmentDocument;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: User.name,
  })
  createdBy: UserDocument;
}

export const UploadEventsSchema = SchemaFactory.createForClass(UploadEvents);
