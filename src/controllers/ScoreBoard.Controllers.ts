import { Request, Response, NextFunction, RequestHandler } from "express";
import { sendError, sendSuccess } from "../utils/apiResponse";
import { ScoreModel } from "../models/ScoreBoard.Models";


//1. Score Upadtion
export const submitScore: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).user?._id;
        const { gameId, gameName, score } = req.body;

        if (!userId) return sendError(res, "User is not authenticated", 401);
        if (!gameId || !gameName || typeof score !== "number") {
            return sendError(res, "All fields are required and score must be a number", 400);
        }

        //if new score is higher then update
        const existing = await ScoreModel.findOne({ userId, gameId });

        if (existing) {
            if (score > existing.score) {
                await ScoreModel.updateOne(
                    { _id: existing._id },
                    { $set: { score } }
                );
                return sendSuccess(res, {}, "New high score updated!");
            } else {
                return sendSuccess(res, {}, "Score was not higher. No update made.");
            }
        }

        // For first-time score
        await ScoreModel.create({ userId, gameId, gameName, score });
        return sendSuccess(res, {}, "Score submitted successfully!", 201);

    } catch (error: any) {
        console.error("Error submitting score:", error);
        return sendError(res, "Server error while submitting score", 500);
    }
};

///ScoreBoard
export const getScoreBoard: RequestHandler = async (req, res) => {
    try {
        const { gameId } = req.params;
        const limit = parseInt(req.query.limit as string) || 20;
        const page = parseInt(req.query.page as string) || 1;

        if (!gameId) return sendError(res, "Game ID is required", 400);

        const scores = await ScoreModel.find({ gameId })
            .sort({ score: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .populate("userId", "username email");

        const totalCount = await ScoreModel.countDocuments({ gameId });

        sendSuccess(res, {
            leaderboard: scores,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        }, "Leaderboard fetched successfully!");

    } catch (error: any) {
        console.error("Error fetching leaderboard:", error);
        sendError(res, "Server error while fetching leaderboard", 500);
    }
};