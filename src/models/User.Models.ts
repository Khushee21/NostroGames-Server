import { model, Schema } from "mongoose";
import { IUser } from "../types/UserType";


const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    refreshTokens: { type: [String], default: [] },
}, {
    timestamps: true
}
);

export const UserModel = model<IUser>('User', UserSchema);