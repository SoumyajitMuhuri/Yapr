import mongoose from "mongoose";
import User from "../models/user.model.js";

export async function validateMessageRecipient(req, res, next) {
  const { id: recipientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(recipientId)) {
    return res.status(400).json({ message: "Invalid recipient" });
  }

  try {
    const recipientExists = await User.exists({ _id: recipientId });
    if (!recipientExists) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    next();
  } catch (error) {
    console.error("Error validating message recipient:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
