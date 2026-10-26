import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { hasImageKitKey, uploadChatMedia } from "../lib/imagekit.js";
import { getReceiverSocketIds, io } from "../lib/socket.js";

const DEFAULT_MESSAGE_PAGE_SIZE = 50;
const MAX_MESSAGE_PAGE_SIZE = 100;
const MAX_MESSAGE_TEXT_LENGTH = 5000;

function encodeMessageCursor(message) {
    return Buffer.from(JSON.stringify({
        createdAt: message.createdAt.toISOString(),
        id: String(message._id),
    })).toString("base64url");
}

function decodeMessageCursor(cursor) {
    try {
        const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
        const createdAt = new Date(parsed.createdAt);
        if (!Number.isFinite(createdAt.getTime()) || !mongoose.Types.ObjectId.isValid(parsed.id)) {
            return null;
        }
        return { createdAt, id: new mongoose.Types.ObjectId(parsed.id) };
    } catch {
        return null;
    }
}

export async function getUserList(req,res) {
    try {
        const currentUserID = req.user._id;

        const userList = await User.find({_id: {$ne: currentUserID}}).select("-clerkId");

        res.status(200).json(userList);
        
    } catch (error) {
        console.error("Error in getUserList:", error);
        res.status(500).json({message:"Internal server error"});
    }
    
}

export async function getConversations(req,res) {
    try {
         const loggedInUserID= req.user._id;

         const conversations = await Message.aggregate([
            { $match: {$or: [{senderId: loggedInUserID},{receiverId: loggedInUserID}] } },
            { $group:{
                _id: {$cond: [{ $eq: ["$senderId", loggedInUserID]}, "$receiverId", "$senderId"] },
                lastMessageAt:{ $max:"$createdAt" },
                unreadCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$receiverId", loggedInUserID] },
                                    { $eq: [{ $type: "$readAt" }, "null"] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
        { $sort: { lastMessageAt: -1 }},
        {$lookup: { from: "users", localField:"_id", foreignField: "_id", as:"user" } },
        { $unwind: "$user" },
        { $set: { "user.unreadCount": "$unreadCount" } },
        { $replaceRoot: { newRoot: "$user" } },
        {$project: {clerkId:0 } },
         ]);

         res.status(200).json(conversations)
        
    } catch (error) {
        console.error("Error in getConversations:",error);
        res.status(500).json({ message:"Internal server error!" });
    }
    
}

export async function getMessages(req, res) {
    try {
        const {id: userToChatId } = req.params;
        const currentUserID = req.user._id;
        const rawLimit = req.query.limit ?? String(DEFAULT_MESSAGE_PAGE_SIZE);
        const limit = Number(rawLimit);
        const rawCursor = req.query.cursor;

        if (!Number.isInteger(limit) || limit < 1 || limit > MAX_MESSAGE_PAGE_SIZE) {
            return res.status(400).json({
                message: `limit must be an integer between 1 and ${MAX_MESSAGE_PAGE_SIZE}`,
            });
        }

        if (rawCursor !== undefined && (typeof rawCursor !== "string" || rawCursor.length > 256)) {
            return res.status(400).json({ message: "Invalid message cursor" });
        }

        const cursor = rawCursor ? decodeMessageCursor(rawCursor) : null;
        if (rawCursor && !cursor) {
            return res.status(400).json({ message: "Invalid message cursor" });
        }

        await Message.updateMany(
            { senderId: userToChatId, receiverId: currentUserID, readAt: null },
            { $set: { readAt: new Date() } },
        );

        const conversationFilter = {
            $or: [
                { senderId: currentUserID, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: currentUserID },
            ],
        };
        const filter = cursor
            ? {
                $and: [
                    conversationFilter,
                    {
                        $or: [
                            { createdAt: { $lt: cursor.createdAt } },
                            { createdAt: cursor.createdAt, _id: { $lt: cursor.id } },
                        ],
                    },
                ],
            }
            : conversationFilter;

        const fetchedMessages = await Message.find(filter)
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit + 1);
        const hasMore = fetchedMessages.length > limit;
        const page = fetchedMessages.slice(0, limit);
        const nextCursor = hasMore ? encodeMessageCursor(page.at(-1)) : null;
        const messages = page.reverse();

        res.status(200).json({ messages, nextCursor, hasMore });

    } catch (error) {
         console.error("Error in getMessages:",error);
        res.status(500).json({ message:"Internal server error!" });
    }
    
}

export async function sendMessage(req, res) {
    try {
        const { text } = req.body || {};
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        if (text !== undefined && typeof text !== "string") {
            return res.status(400).json({ message: "Message text must be a string" });
        }
        const normalizedText = typeof text === "string" ? text.trim() : "";
        if (normalizedText.length > MAX_MESSAGE_TEXT_LENGTH) {
            return res.status(400).json({
                message: `Message text cannot exceed ${MAX_MESSAGE_TEXT_LENGTH} characters`,
            });
        }
        if (!normalizedText && !req.file) {
            return res.status(400).json({ message: "A message must include text or media" });
        }
        let imageURL;
        let videoURL;

        if(req.file){
            if(!hasImageKitKey()){
                return res.status(500).json({ message: "ImageKit is not configured"});
            }
            const url = await uploadChatMedia(req.file);

            if(req.file.mimetype.startsWith("video/")) videoURL = url;
            else imageURL = url;

        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text: normalizedText,
            image: imageURL,
            video: videoURL,
        });

        await newMessage.save();

        const receiverSocketIds = getReceiverSocketIds(receiverId);

        for(const socketId of receiverSocketIds){
            io.to(socketId).emit("newMessage", newMessage);
        }

        res.status(201).json({newMessage})
        
    } catch (error) {
         console.error("Error in sendMessage:",error);
        res.status(500).json({ message:"Internal server error!" });
    }
    
}
