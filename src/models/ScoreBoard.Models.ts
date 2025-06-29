import { model, Schema, Types } from "mongoose";
import { SUSer } from "../types/ScoreTypes";

const ScoreBoardSchema = new Schema<SUSer>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    gameId: {
        type: String,
        required: true,
    },
    gameName: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true
});

export const ScoreModel = model<SUSer>('ScoreBoard', ScoreBoardSchema);
