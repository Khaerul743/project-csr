import { chatbotController } from "@/modules/ai";

export async function POST(request: Request) {
  return chatbotController.chat(request);
}
