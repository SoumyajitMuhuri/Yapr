import express from "express";
import cors from "cors";
import "dotenv/config"

import User from "./models/user.model.js"
import { connectDB } from "./lib/db.js";
import { clerkMiddleware } from "@clerk/express"

const app=express();

const PORT=process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

app.use(express.json())
app.use(cors({origin:CLIENT_URL, credentials:true}));
app.use(clerkMiddleware())

app.get("/health",(req,res)=>{
    res.status(200).json({ok:true});
})

app.listen(PORT, ()=>{
    connectDB();
    console.log(`Server is running on port http://localhost:${PORT}`);
});

