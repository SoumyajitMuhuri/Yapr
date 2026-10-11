import express from "express";
import { getUserList } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/users",protectRoute, getUserList)

export default router;