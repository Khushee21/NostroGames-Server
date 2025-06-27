import { Router } from "express";
import {
    signup,
    login,
    logout,
    refreshTokenHandler,

} from "../controllers/Auth.Controllers";

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', logout);

export default router;