import express from "express";
import cors from "cors";

import "dotenv/config";

import fs from "fs";
import path from "path";

import User from "./models/user.model.js"
import { connectDB } from "./lib/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhook from "./webhooks/clerk.webhook.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

import job from "./lib/cron.js";
import { app,server } from "./lib/socket.js";


const PORT=process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

const publicDir = path.join(process.cwd(), "public")

app.use("/api/webhooks/clerk",express.raw({type: "application/json" }), clerkWebhook);

app.use(express.json())
app.use(cors({origin:CLIENT_URL, credentials:true}));
app.use(clerkMiddleware())

app.get("/health",(req,res)=>{
    res.status(200).json({ok:true});
})

app.use("/api/auth",authRoutes);
app.use("/api/messages", messageRoutes);

if(fs.existsSync(publicDir)){

    app.use(express.static(publicDir))

    app.get("/{*any}",(req,res,next)=>{
        res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
    });

}

server.listen(PORT, ()=>{
    connectDB();
    console.log(`Server is running on port http://localhost:${PORT}`);
    process.env.NODE_ENV==="production" && job.start();
});
     
