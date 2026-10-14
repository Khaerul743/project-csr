import { ConversationRepository } from "./conversation.repository";
import {
  SendMessageDTO,
  ConversationListItem,
  MessageWithSender,
} from "./conversation.interface";
import { JwtUserPayload } from "@/common/jwt/jwt.interface";
import {
  ForBiddenError,
  NotFoundError,
  BadRequestError,
} from "@/common/errors/app-error";

export class ConversationService {
  constructor(private readonly conversationRepository: ConversationRepository) {}

  private validateRole(authUser: JwtUserPayload) {
    if (authUser.role === "MANAGEMENT") {
      throw new ForBiddenError(
        "Role Manajemen hanya memiliki akses pemantauan. Percakapan dan negosiasi teknis dikelola oleh CSR_ADMIN."
      );
    }
    if (authUser.role !== "CSR_ADMIN" && authUser.role !== "PARTNER_ADMIN") {
      throw new ForBiddenError("Anda tidak memiliki hak akses ke modul percakapan");
    }
  }

  async getConversations(authUser: JwtUserPayload): Promise<ConversationListItem[]> {
    this.validateRole(authUser);

    if (authUser.role === "CSR_ADMIN") {
      if (!authUser.companyId) {
        throw new BadRequestError("Pengguna belum terhubung dengan profil perusahaan");
      }
      return this.conversationRepository.getConversations(
        { companyId: authUser.companyId },
        authUser.sub
      );
    } else {
      if (!authUser.partnerId) {
        throw new BadRequestError("Pengguna belum terhubung dengan profil mitra");
      }
      return this.conversationRepository.getConversations(
        { partnerId: authUser.partnerId },
        authUser.sub
      );
    }
  }

  async getMessages(
    collaborationId: string,
    authUser: JwtUserPayload
  ): Promise<MessageWithSender[]> {
    this.validateRole(authUser);

    const collab = await this.conversationRepository.findCollaborationById(collaborationId);
    if (!collab) {
      throw new NotFoundError("Kolaborasi tidak ditemukan");
    }

    if (
      (authUser.role === "CSR_ADMIN" && collab.companyId !== authUser.companyId) ||
      (authUser.role === "PARTNER_ADMIN" && collab.partnerId !== authUser.partnerId)
    ) {
      throw new ForBiddenError("Anda bukan bagian dari kolaborasi ini");
    }

    // Mark incoming messages as read
    await this.conversationRepository.markAsRead(collaborationId, authUser.sub);

    return this.conversationRepository.getMessages(collaborationId);
  }

  async sendMessage(
    collaborationId: string,
    input: SendMessageDTO,
    authUser: JwtUserPayload
  ): Promise<MessageWithSender> {
    this.validateRole(authUser);

    if (!input.content || !input.content.trim()) {
      throw new BadRequestError("Konten pesan tidak boleh kosong");
    }

    const collab = await this.conversationRepository.findCollaborationById(collaborationId);
    if (!collab) {
      throw new NotFoundError("Kolaborasi tidak ditemukan");
    }

    if (
      (authUser.role === "CSR_ADMIN" && collab.companyId !== authUser.companyId) ||
      (authUser.role === "PARTNER_ADMIN" && collab.partnerId !== authUser.partnerId)
    ) {
      throw new ForBiddenError("Anda tidak memiliki izin mengirim pesan pada kolaborasi ini");
    }

    return this.conversationRepository.createMessage({
      collaborationId,
      senderId: authUser.sub,
      content: input.content.trim(),
      attachmentUrl: input.attachmentUrl?.trim() || null,
      attachmentName: input.attachmentName?.trim() || null,
      isRead: false,
    });
  }
}
