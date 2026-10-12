import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { hasImageKitKey, uploadChatMedia } from "../lib/imagekit.js";

export async function getUserList(req,res) {
    try {
        const currentUserID = req.user._id;

        const userList = await User.find({_id: {$ne: currentUserID}}).select("-clerkID");

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
            },
        },
        { $sort: { lastMessageAt: -1 }},
        {$lookup: { from: "users", localField:"_id", foreignField: "_id", as:"user" } },
        {$replaceRoot: {newRoot: {$first: "$user"} } },
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

        const messages = await Message.find({
            $or:[{senderId:currentUserID, receiverId: userToChatId},
                {senderId:userToChatId, receiverId: currentUserID}
            ]
        }).sort({createdAt:1});

        res.status(200).json(messages);

    } catch (error) {
         console.error("Error in getMessages:",error);
        res.status(500).json({ message:"Internal server error!" });
    }
    
}

export async function sendMessage(req, res) {
    try {
        const { text } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
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
            text,
            image: imageURL,
            video: videoURL,
        });

        await newMessage.save();

        //todo:socketIO

        res.status(201).json({newMessage})
        
    } catch (error) {
         console.error("Error in sendMessage:",error);
        res.status(500).json({ message:"Internal server error!" });
    }
    
}