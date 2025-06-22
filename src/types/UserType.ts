import { Document, Types } from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    emailVerified: Boolean;
    createdAt: Date;
    refreshToken: string[];
    updatedAt: Date;
}