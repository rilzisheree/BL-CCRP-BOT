import mongoose, { Document } from "mongoose";
export interface IGlobalBan extends Document {
    userId: string;
    username: string;
    reason: string;
    bannedBy: string;
    bannedByUsername: string;
    bannedAt: Date;
}
declare const _default: mongoose.Model<IGlobalBan, {}, {}, {}, mongoose.Document<unknown, {}, IGlobalBan, {}, {}> & IGlobalBan & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=GlobalBan.d.ts.map