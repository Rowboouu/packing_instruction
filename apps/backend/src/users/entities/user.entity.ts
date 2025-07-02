import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User> & {
  verifyPass(password: string): Promise<boolean>;
};

@Schema({ timestamps: true, toJSON: { virtuals: true, versionKey: false } })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  @Exclude()
  password: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  role: string;

  @Prop()
  permission: string;

  @Prop({ default: 'en' })
  language?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  const hash = bcrypt.hashSync(this.password, salt);
  this.password = hash;
  next();
});

UserSchema.methods.verifyPass = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password).catch(() => false);
};
