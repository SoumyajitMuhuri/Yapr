import express from "express";
import http from "http";
import { Server } from "socket.io";
import { verifyToken } from "@clerk/backend";
import User from "../models/user.model.js";

const app = express();
const server=http.createServer(app);

const allowedOrigin = process.env.CLIENT_URL

const io=new Server(server, { cors:{ origin: [allowedOrigin]} });

const userSocketMap = {};

io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (typeof token !== "string" || !token || !process.env.CLERK_SECRET_KEY) {
        return next(new Error("Unauthorized"));
    }

    try {
        const claims = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
            ...(allowedOrigin ? { authorizedParties: [allowedOrigin] } : {}),
        });
        if (!claims.sub) return next(new Error("Unauthorized"));

        const user = await User.findOne({ clerkId: claims.sub }).select("_id");
        if (!user) return next(new Error("Unauthorized"));

        socket.data.userId = String(user._id);
        next();
    } catch {
        next(new Error("Unauthorized"));
    }
});

function getReceiverSocketIds(userId){
    return [...(userSocketMap[userId] || [])];
}




io.on("connection", (socket)=>{
    const userId = socket.data.userId;

    if(userId){
        userSocketMap[userId] ||= new Set();
        userSocketMap[userId].add(socket.id);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        if(userId){
            userSocketMap[userId]?.delete(socket.id);
            if(userSocketMap[userId]?.size === 0) delete userSocketMap[userId];
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app,server,io,getReceiverSocketIds };
