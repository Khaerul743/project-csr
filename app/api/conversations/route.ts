import { connection } from "next/server";
import { conversationController } from "@/modules/conversations";

export async function GET(request: Request) {
  await connection();
  return conversationController.getConversations(request);
}
