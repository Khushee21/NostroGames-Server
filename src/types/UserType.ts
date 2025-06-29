import { Document, Types } from "mongoose";

export interface IUser extends Document {
    _id: string;
    email: string;
    password: string;
    name: string;
    emailVerified: Boolean;
    createdAt: Date;
    refreshTokens: string[];
    updatedAt: Date;
}