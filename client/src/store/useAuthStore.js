import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const BASE_URL= import.meta.env.MODE === "development" ? "http://localhost:3000" : "/"

export const useAuthStore = create((set, get)=>({
    authUser: null,
    isCheckingAuth: true,
    onlineUsers:[],
    socket:null,

    checkAuth: async(getToken)=>{
        set({isCheckingAuth: true});
        
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser:res.data });

            get().connectSocket(res.data, getToken);
            
        } catch (error) {
            console.error("Error in checkAuth:",error);
            set({ authUser:null });
        }
        finally{
            set({isCheckingAuth: false});
        }
    },

    clearAuth: ()=>{
        set({authUser: null, isCheckingAuth:false,  onlineUsers:[]});
        get().disconnectSocket();
    },

    connectSocket: (user, getToken) => {
        if(!user) return;

        const socketAuth = (callback) => {
            getToken()
                .then((token) => callback({ token }))
                .catch(() => callback({ token: null }));
        };

        const existingSocket = get().socket;
        if(existingSocket){
            existingSocket.auth = socketAuth;
            if(!existingSocket.connected) existingSocket.connect();
            return;
        }

        const socket = io(BASE_URL,{ auth: socketAuth });
        
        set({socket})

        socket.on("getOnlineUsers", (userIds) => {
            set({onlineUsers: userIds});
        });
    },

    disconnectSocket: ()=>{
        const socket= get().socket;
        socket?.disconnect();
        set({socket: null});
    },
}));
