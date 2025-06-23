import { Request, Response, NextFunction, RequestHandler } from "express";
import bcryt from 'bcrypt';
import { UserModel } from "../models/User.Models";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { signAccessToken, signRefreshAccess, verifyRefreshToken } from "../utils/jwt";
import { Types } from "mongoose";
import { generateAndSendOtp, verifyOtp } from "../services/otp";

//1. Request otp
const requestOtp: RequestHandler = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return sendError(res, "Pls Provide Email To Send Email", 401);
        await generateAndSendOtp(email);
        return sendSuccess(res, null, 'OTP sent to email', 200);
    }
    catch (err: any) {
        return sendError(res, err.message || 'Failed to send OTP', 500, err);
    }
}

//2. verify otp
const verifyOtpHandler: RequestHandler = (req, res, next) => {
    try {
        const { email, code } = req.body;
        verifyOtp(email, code);
        return sendSuccess(res, null, 'OTP verified', 200);
    } catch (err: any) {
        return sendError(res, err.message || 'OTP verification failed', 400, err);
    }
}
//3. Sign in
const signup: RequestHandler = async (req, res, next) => {
    try {
        const { email, code, password } = req.body;
        const missingFeild = [];
        if (!email) missingFeild.push('email');
        if (!code) missingFeild.push('code');
        if (!password) missingFeild.push('password');
        if (missingFeild.length > 0) {
            return sendError(res, `Missing required Fields: ${missingFeild.join(', ')}`, 400);
        }

        //duplicate email verification
        const existingUser = await UserModel.findOne({ email });
        if (!existingUser) {
            return sendError(res, 'Email already exists', 409);
        }
        await verifyOtp(email, code);

        //convert pass to hash
        const hash = await bcryt.hash(password, 10);

        const user = await UserModel.create({ email, password: hash, emailVerified: true });
        if (!user) {
            return sendError(res, "Error While Creating User Pls Try Again", 501);
        }
        const payload = { userId: (user._id as string), email: user.email };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshAccess(payload);
        user.refreshToken.push(refreshToken);
        await user.save();
        const userWithoutPassword = user.toObject();
        delete (userWithoutPassword as { password?: string }).password;
        return sendSuccess(res, { user: userWithoutPassword, accessToken, refreshToken }, 'Signin Successfull!', 201);
    }
    catch (err: any) {
        console.log("error", err);
        return sendError(res, err.message || 'Signup Failed', 400, err);
    }
};

//4. Sign up
const login: RequestHandler = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) sendError(res, "Pls provide Email nd Password", 401);
        const user = await UserModel.findOne({ email }) as InstanceType<typeof UserModel> | null;
        if (!user) return sendError(res, 'Invalid credentials Email not found', 404);
        const match = await bcryt.compare(password, user.password);
        if (!match) return sendError(res, "Invalid password !", 401);

        const payload = { userId: (user._id as Types.ObjectId).toString(), email: user.email };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshAccess(payload);

        //save refresh token
        user.refreshToken.push(refreshToken);
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

//5. refreshTokenHandler 
const refreshTokenHandler: RequestHandler = async (req, res, next) => {
    const { refreshToken } = req.body;
    try {
        if (!refreshToken) return sendError(res, 'Refresh token required', 400);
        const payload = verifyRefreshToken(refreshToken);

        //find user and check token
        const user = await UserModel.findById(payload.userId);
        if (!user || !user.refreshToken.includes(refreshToken)) {
            return sendError(res, 'Invalid refresh Token', 403);
        }

        // optionally rotate tokens
        user.refreshToken = user.refreshToken.filter(rt => rt !== refreshToken);
        const newRefreshToken = signRefreshAccess({ userId: payload.userId, email: payload.email });
        user.refreshToken.push(newRefreshToken);
        await user.save();

        const newAccessToken = signAccessToken({ userId: payload.userId, email: payload.email });
        const Cleaneduser = user.toObject();
        delete (Cleaneduser as { password?: string }).password;
        delete (Cleaneduser as { refreshToken?: Array<any> }).refreshToken;
        return sendSuccess(res, { accessToken: newAccessToken, refreshToken: newRefreshToken, user: Cleaneduser }, 'Token refreshed', 200);
    }
    catch (err: any) {
        return sendError(res, 'Could not refresh token', 403, err);
    }
};


//6. Logout route
const logout: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    try {
        if (!refreshToken) return sendError(res, 'Refresh token reuired', 400);
        const payload = verifyRefreshToken(refreshToken);
        const user = await UserModel.findById(payload.userId);
        if (!user) return sendError(res, 'Invalid refresh token', 403);

        //remove refresh token
        user.refreshToken = user.refreshToken.filter(rt => rt !== refreshToken);
        await user.save();

        return sendSuccess(res, null, 'Logged out Successfully', 200);
    }
    catch (err: any) {
        return sendError(res, 'Logout failed', 500, err);
    }
}


export {
    requestOtp,
    login,
    logout,
    signup,
    refreshTokenHandler,
    verifyOtpHandler,
};