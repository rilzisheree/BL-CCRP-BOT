import mongoose, { Document } from "mongoose";
export interface IAllowedUser extends Document {
    userId: string;
    guildId: string;
    command: string;
    grantedBy: string;
    grantedAt: Date;
}
declare const _default: mongoose.Model<IAllowedUser, {}, {}, {}, mongoose.Document<unknown, {}, IAllowedUser, {}, {}> & IAllowedUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=AllowedUser.d.ts.map