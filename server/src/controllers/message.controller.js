import User from "../models/user.model.js";

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