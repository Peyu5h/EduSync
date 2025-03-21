import express from "express";
import authRouter from "./authRoute.js";
import userRouter from "./userRoute.js";
import adminRouter from "./adminOnlyRoute.js";
import classRouter from "./classRoute.js";
import messageRouter from "./messageRoute.js";
import analyticsRouter from "./analyticsRoute.js";
import quizRouter from "./quizRoute.js";
const router = express.Router();
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/class", classRouter);
router.use("/message", messageRouter);
router.use("/analytics", analyticsRouter);
router.use("/quiz", quizRouter);
export default router;
