import { Schema, Types, model } from "mongoose";

export interface IOtp extends Document {
    userId?: Types.ObjectId;
    email: string;
    code: string;
    expiresAt: Date;
    used: boolean;
}

const OtpSchema = new Schema<IOtp>({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
}, {
    timestamps: true
});

export const OtpModel = model<IOtp>('Otp', OtpSchema);