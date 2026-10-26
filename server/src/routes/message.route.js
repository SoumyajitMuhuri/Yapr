import express from "express";
import { getConversations, getMessages, getUserList, sendMessage } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { limitMediaUploads, sendMessageRateLimit } from "../middleware/rateLimit.middleware.js";
import { uploadSingleMedia, validateUploadedMedia } from "../middleware/upload.middleware.js";
import { validateMessageRecipient } from "../middleware/validateMessageRecipient.js";

const router = express.Router();

router.use(protectRoute);

router.get("/users", getUserList);
router.get("/conversations", getConversations);
router.get("/:id", getMessages);
router.post(
  "/send/:id",
  sendMessageRateLimit,
  limitMediaUploads,
  validateMessageRecipient,
  uploadSingleMedia,
  validateUploadedMedia,
  sendMessage,
);

export default router;
