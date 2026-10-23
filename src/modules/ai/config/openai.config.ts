import { ChatOpenAI } from "@langchain/openai";
import { AppLogger } from "@/common/logger/app-logger";

const logger = new AppLogger("OpenAIConfig");

export function getOpenAIChatModel(modelName = "gpt-4o-mini", temperature = 0.2): ChatOpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your-openai-api-key-here") {
    logger.warn("OPENAI_API_KEY tidak ditemukan atau masih placeholder di .env");
    return null;
  }

  return new ChatOpenAI({
    model: modelName,
    temperature,
    apiKey,
  });
}
