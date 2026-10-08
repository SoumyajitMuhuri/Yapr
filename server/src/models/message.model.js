import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        req:true,
    },
    receiverID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        req:true,
    },
    text:{
        type:String,
    },
    image:{
        type:String,
    },
    video:{
        type:String,
    }
},{timestamps:true})

const Message = mongoose.model("Message",messageSchema)

export default Message;