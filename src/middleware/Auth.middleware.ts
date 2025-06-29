import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/apiResponse";
import { verifyAccessToken } from "../utils/jwt";
import { UserModel } from "../models/User.Models";

interface AuthenticationRequest extends Request {
    user?: {
        _id: string;
        email: string;
    };
}

export const isAuthenticated = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendError(res, "No token provided", 401);
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyAccessToken(token);

        if (!decoded?.userId) {
            return sendError(res, "Invalid token payload", 401);
        }

        const user = await UserModel.findById(decoded.userId).select("_id email");

        if (!user) {
            return sendError(res, "User not found", 404);
        }

        req.user = {
            _id: user._id,
            email: user.email,
        };

        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return sendError(res, "Invalid or expired token", 401);
    }
};
