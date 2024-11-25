"use server";

import { StreamClient } from "@stream-io/node-sdk";
import { getServerSession } from "next-auth";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

export const tokenProvider = async () => {
    const session = await getServerSession();
    const user = session?.user;
    if (!user) throw new Error("No user found");
    if (!apiKey) throw new Error("No apiKey found");
    if (!apiSecret) throw new Error("No apiSecret found");

    const client=new StreamClient(apiKey, apiSecret);
    const exp= Math.floor(Date.now() / 1000) + 3600; // 1 hour
    const issuedAt = Math.floor(Date.now() / 1000)-60;
    const token = client.generateUserToken({ user_id: user.id, exp, iat: issuedAt });
    return token;
}