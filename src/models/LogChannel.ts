import mongoose, { Document, Schema } from "mongoose";

export interface ILogChannel extends Document {
  channelId: string;
  setBy: string;
  setAt: Date;
}

const LogChannelSchema = new Schema<ILogChannel>({
  channelId: { type: String, required: true },
  setBy: { type: String, required: true },
  setAt: { type: Date, default: Date.now },
});

export default mongoose.model<ILogChannel>("LogChannel", LogChannelSchema);
