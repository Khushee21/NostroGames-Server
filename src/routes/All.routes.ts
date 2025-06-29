import { Router } from "express";
import {
    signup,
    login,
    logout,
    refreshTokenHandler,

} from "../controllers/Auth.Controllers";
import { getScoreBoard, submitScore } from "../controllers/ScoreBoard.Controllers";
import { isAuthenticated } from "../middleware/Auth.middleware";

const router = Router();

//AUTH
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', logout);


//SCOREBOARD
router.post("/submit", isAuthenticated, submitScore);
router.get("/leaderboard/:gameId", getScoreBoard);

export default router;