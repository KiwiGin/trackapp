import { StreamChat } from "stream-chat";
import type { NextApiRequest, NextApiResponse } from "next";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const secretKey = process.env.NEXT_STREAM_SECRET_KEY!; // 🔒 Solo en el backend

if (!apiKey || !secretKey) {
  throw new Error("Stream API keys are missing");
}

const serverClient = StreamChat.getInstance(apiKey, secretKey);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "Falta el userId" });
  }

  try {
    const token = serverClient.createToken(userId);
    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error generando el token" });
  }
}
