import { ConversationRepository } from "./conversation.repository";
import { ConversationService } from "./conversation.service";
import { ConversationController } from "./conversation.controller";

export const conversationRepository = new ConversationRepository();
export const conversationService = new ConversationService(conversationRepository);
export const conversationController = new ConversationController(conversationService);

export * from "./conversation.interface";
export * from "./conversation.validation";
