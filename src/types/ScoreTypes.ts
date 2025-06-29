import { Types } from "mongoose";

export interface SUSer {
    userId: Types.ObjectId;
    gameId: string;
    gameName: string;
    score: number;
    createdAt?: Date;
    updatedAt?: Date;
}
