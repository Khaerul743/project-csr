import { ChatOpenAI } from "@langchain/openai";
import { AppLogger } from "@/common/logger/app-logger";
import { isAiFeatureEnabled } from "@/common/config/ai-feature-flag";

export { isAiFeatureEnabled };

const logger = new AppLogger("OpenAIConfig");

export function getOpenAIChatModel(modelName = "gpt-4o-mini", temperature = 0.2): ChatOpenAI | null {
  if (!isAiFeatureEnabled()) {
    logger.info("Fitur AI dinonaktifkan via environment variable (ENABLE_AI_FEATURES / NEXT_PUBLIC_ENABLE_AI = false)");
    return null;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your-openai-api-key-here") {
    logger.warn("OPENAI_API_KEY tidak ditemukan atau masih placeholder di .env");
    return null;
  }

  const targetModel = process.env.OPENAI_MODEL || modelName;

  return new ChatOpenAI({
    model: targetModel,
    temperature,
    apiKey,
  });
}

