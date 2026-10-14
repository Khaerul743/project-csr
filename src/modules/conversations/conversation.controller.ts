import { NextResponse } from "next/server";
import { ApiResponse } from "@/common/utils/api-response";
import { ErrorHandler } from "@/common/utils/error-handler";
import { AuthGuard } from "@/common/guards/auth.guard";
import { ConversationService } from "./conversation.service";
import { sendMessageSchema } from "./conversation.validation";

export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  async getConversations(request: Request): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      const conversations = await this.conversationService.getConversations(authUser);
      return ApiResponse.success(conversations, "Daftar percakapan berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async getMessages(request: Request, collaborationId: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      const messages = await this.conversationService.getMessages(collaborationId, authUser);
      return ApiResponse.success(messages, "Riwayat pesan berhasil diambil");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  async sendMessage(request: Request, collaborationId: string): Promise<NextResponse> {
    try {
      const authUser = AuthGuard.authenticate(request);
      const body = await request.json();
      const validatedInput = sendMessageSchema.parse(body);

      const created = await this.conversationService.sendMessage(
        collaborationId,
        validatedInput,
        authUser
      );

      return ApiResponse.created(created, "Pesan berhasil dikirim");
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}
