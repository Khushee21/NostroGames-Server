import { Request, Response, NextFunction, RequestHandler } from "express";
import bcrypt from 'bcrypt';
import { UserModel } from "../models/User.Models";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { signAccessToken, signRefreshAccess, verifyRefreshToken } from "../utils/jwt";


//1. Sign up
const signup: RequestHandler = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const missingFeild = [];
        if (!email) missingFeild.push('email');
        if (!password) missingFeild.push('password');
        if (missingFeild.length > 0) {
            return sendError(res, `Missing required Fields: ${missingFeild.join(', ')}`, 400);
        }

        //convert pass to hash
        const hash = await bcrypt.hash(password, 10);

        const user = await UserModel.create({ email, password: hash, emailVerified: true });
        if (!user) {
            return sendError(res, "Error While Creating User Pls Try Again", 501);
        }
        const payload = { userId: (user._id as string), email: user.email };
        const accessToken = signAccessToken(payload);
        const refreshTokens = signRefreshAccess(payload);
        user.refreshTokens.push(refreshTokens);
        await user.save();
        const userWithoutPassword = user.toObject();
        delete (userWithoutPassword as { password?: string }).password;
        return sendSuccess(res, { user: userWithoutPassword, accessToken, refreshTokens }, 'Signin Successfull!', 201);
    }
    catch (err: any) {
        console.log("error", err);
        return sendError(res, err.message || 'Signup Failed', 400, err);
    }
};

//2. Sign in
const login: RequestHandler = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return sendError(res, "Pls provide Email nd Password", 401);
        const user = await UserModel.findOne({ email });
        if (!user) return sendError(res, 'Invalid credentials Email not found', 404);
        const match = await bcrypt.compare(password, user.password);
        if (!match) return sendError(res, "Invalid password !", 401);

        const payload = { userId: user._id.toString(), email: user.email };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshAccess(payload);

        //save refresh token
        user.refreshTokens.push(refreshToken);
        await user.save();

        const Cleaneduser = user.toObject();
        delete (Cleaneduser as { password?: string }).password;
        delete (Cleaneduser as { refreshTokens?: Array<any> }).refreshTokens;
        return sendSuccess(res, { accessToken, refreshToken, user: Cleaneduser }, 'Login Successful!', 200);
    }
    catch (err: any) {
        return sendError(res, err.message, 500, err);
    }
};

//3. refreshTokenHandler 
const refreshTokenHandler: RequestHandler = async (req, res, next) => {
    const { refreshToken } = req.body;
    try {
        if (!refreshToken) return sendError(res, 'Refresh token required', 400);
        const payload = verifyRefreshToken(refreshToken);

        //find user and check token
        const user = await UserModel.findById(payload.userId);
        if (!user || !user.refreshTokens.includes(refreshToken)) {
            return sendError(res, 'Invalid refresh Token', 403);
        }

        // optionally rotate tokens
        user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
        const newRefreshToken = signRefreshAccess({ userId: payload.userId, email: payload.email });
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        const newAccessToken = signAccessToken({ userId: payload.userId, email: payload.email });
        const Cleaneduser = user.toObject();
        delete (Cleaneduser as { password?: string }).password;
        delete (Cleaneduser as { refreshTokens?: Array<any> }).refreshTokens;
        return sendSuccess(res, { accessToken: newAccessToken, refreshToken: newRefreshToken, user: Cleaneduser }, 'Token refreshed', 200);
    }
    catch (err: any) {
        return sendError(res, 'Could not refresh token', 403, err);
    }
};


//4. Logout route
const logout: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    try {
        if (!refreshToken) return sendError(res, 'Refresh token reuired', 400);
        const payload = verifyRefreshToken(refreshToken);
        const user = await UserModel.findById(payload.userId);
        if (!user) return sendError(res, 'Invalid refresh token', 403);

        //remove refresh token
        user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
        await user.save();

        return sendSuccess(res, null, 'Logged out Successfully', 200);
    }
    catch (err: any) {
        return sendError(res, 'Logout failed', 500, err);
    }
}


export {
    login,
    logout,
    signup,
    refreshTokenHandler,
};