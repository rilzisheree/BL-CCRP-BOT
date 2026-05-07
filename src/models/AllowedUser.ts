import mongoose, { Document, Schema } from "mongoose";

export interface IAllowedUser extends Document {
  userId: string;
  guildId: string;
  command: string;
  grantedBy: string;
  grantedAt: Date;
}

const AllowedUserSchema = new Schema<IAllowedUser>({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  command: { type: String, required: true },
  grantedBy: { type: String, required: true },
  grantedAt: { type: Date, default: Date.now },
});

AllowedUserSchema.index({ userId: 1, guildId: 1, command: 1 }, { unique: true });

export default mongoose.model<IAllowedUser>("AllowedUser", AllowedUserSchema);
