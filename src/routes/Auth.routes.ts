import { Router } from "express";
import {
    requestOtp,
    signup,
    login,
    logout,
    verifyOtpHandler,
    refreshTokenHandler,

} from "../controllers/Auth.Controllers";

const router = Router();


router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtpHandler);
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', logout);

export default router;