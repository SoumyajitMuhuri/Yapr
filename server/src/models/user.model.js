import mongoose from "mongoose"

const userSchema = new mongoose.Schema({

    clerkID:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    fullName:{
        type:String,
        required:true,
    },
    pfp:{
        type:String,
        default:""
    }
},{timestamps:true},
);

const User = mongoose.model("User",userSchema)

export default User;