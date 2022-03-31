import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  // Discord User ID for this user.
  @Prop({ type: String })
  discord: string;

  // Steam64 ID for this user.
  @Prop({ type: String })
  steam: string;

  // Date in which they linked their accounts first.
  @Prop({ type: Date })
  linkedAt: Date;

  // Date in which they last updated their linked status.
  @Prop({ type: Date })
  updated: Date;

  // The nickname this user had when first linking their accounts.
  @Prop({ type: String })
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
