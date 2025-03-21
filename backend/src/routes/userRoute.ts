import express from "express";
import { getUserById, getUsers } from "../controllers/userController.js";
import { jwtMiddleware } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

// Get user by ID
router.get("/:userId", getUserById);

// Get all users (with optional filtering)
router.get("/", getUsers);

export default router;
