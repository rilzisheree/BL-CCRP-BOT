import mongoose, { Document } from "mongoose";
export interface ILogChannel extends Document {
    channelId: string;
    setBy: string;
    setAt: Date;
}
declare const _default: mongoose.Model<ILogChannel, {}, {}, {}, mongoose.Document<unknown, {}, ILogChannel, {}, {}> & ILogChannel & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=LogChannel.d.ts.map