import mongoose from "mongoose";

export async function connectDB(){
    try{
        const mongoURI=process.env.MONGO_DB_URI

        if(!mongoURI){
            throw new Error("MONGO_DB_URI is required");
        }

       const conn = await mongoose.connect(mongoURI);

        console.log("Database Connected",conn.connection.host);
    }
    catch(err){
        console.error("Database Connection Error",err.message);
        process.exit(1)
    }
}