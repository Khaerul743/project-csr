export * from "./ai.interface";
export * from "./config/openai.config";
export * from "./services/document-parser/pdf-parser.service";
export * from "./services/milestone-extraction/milestone-extractor.schema";
export * from "./services/milestone-extraction/milestone-extractor.prompt";
export * from "./services/milestone-extraction/milestone-extractor.service";
export * from "./services/proposal-screener/proposal-screener.schema";
export * from "./services/proposal-screener/proposal-screener.prompt";
export * from "./services/proposal-screener/proposal-screener.service";
export * from "./services/esg-report/esg-report.schema";
export * from "./services/esg-report/esg-report.prompt";
export * from "./services/esg-report/esg-report.service";
export * from "./services/sentiment-analysis";
export * from "./services/proposal-optimizer";
export * from "./services/chatbot";

import { ChatbotService } from "./services/chatbot/chatbot.service";
import { ChatbotController } from "./services/chatbot/chatbot.controller";

export const chatbotService = new ChatbotService();
export const chatbotController = new ChatbotController(chatbotService);
