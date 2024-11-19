"use server";

import { useSession } from "next-auth/react";
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
}