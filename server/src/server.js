import express from "express";
import cors from "cors";

import "dotenv/config";

import fs from "fs";
import path from "path";

import User from "./models/user.model.js"
import { connectDB } from "./lib/db.js";
import { clerkMiddleware } from "@clerk/express"

import job from "./lib/cron.js";

const app=express();

const PORT=process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

const publicDir = path.join(process.cwd(), "public")

app.use(express.json())
app.use(cors({origin:CLIENT_URL, credentials:true}));
app.use(clerkMiddleware())

app.get("/health",(req,res)=>{
    res.status(200).json({ok:true});
})

if(fs.existsSync(publicDir)){

    app.use(express.static(publicDir))

    app.get("/{*any}",(req,res,next)=>{
        res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
    });

}

app.listen(PORT, ()=>{
    connectDB();
    console.log(`Server is running on port http://localhost:${PORT}`);
    process.env.NODE_ENV==="production" && job.start();
});
     
