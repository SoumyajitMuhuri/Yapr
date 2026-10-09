import express from "express";
import User from "../models/user.model";
import { verifyWebhook } from "@clerk/backend/webhooks"

const router = express.Router();

router.post("/", async (req,res) => {
    try {
        const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if(!signingSecret){
        res.status(503).json({ message: "Webhook secret missing" });
        return;
    }

    const payload = Buffer.isBuffer(req.body)? req.body.toString("utf8") : String(req.body);
    const request = new Request("http://internal/webhooks/clerk", {
        method:"POST",
        headers: new Headers(req.headers),
        body:payload,
    });

    const evt = await verifyWebhook(request,{ signingSecret });

    if(evt.type === "user.created" || evt.type === "user.updated"){
        const user = evt.data;
        const email=
        user.email_addresses?.find((e)=>e.id === user.primary_email_address_id)?.email_address ??
        user.email_addresses?.[0]?.email_address;

        const fullName=
        [user.first_name, user.last_name].filter(Boolean).join(" ") ||
        user.username ||
        email?.split("@")[0];

        await User.findOneAndUpdate({clerkID:user.id},
            {clerkID: user.id, email, fullName, profilePic:user.image_url},
            {new:true, upsert: true, setDefaultsOnInsert: true },
        );
    }

    if(evt.type=== "user.deleted"){
        if(evt.data.id){
            await User.findOneAndDelete({clerkID:evt.data.id});
        }
    }
    res.status(200).json({ received:true });
    } catch (error) {
        console.error("Error in Clerk webhook:", error);
        res.status(400).json({message:"Webhook verification failed"});
    }
});

export default router;