import { db } from "@/db";
import {
  collaborationMessages,
  CollaborationMessage,
  NewCollaborationMessage,
} from "@/db/schema/collaboration-messages";
import { collaborations, Collaboration } from "@/db/schema/collaborations";
import { opportunities } from "@/db/schema/opportunities";
import { proposals } from "@/db/schema/proposals";
import { companies } from "@/db/schema/companies";
import { partners } from "@/db/schema/partners";
import { users } from "@/db/schema/users";
import { eq, and, ne, desc, asc, count } from "drizzle-orm";
import { ConversationListItem, MessageWithSender } from "./conversation.interface";

export class ConversationRepository {
  async findCollaborationById(collaborationId: string): Promise<Collaboration | null> {
    const [collab] = await db
      .select()
      .from(collaborations)
      .where(eq(collaborations.id, collaborationId))
      .limit(1);

    return collab || null;
  }

  async getConversations(
    filter: { companyId?: string; partnerId?: string },
    currentUserId: string
  ): Promise<ConversationListItem[]> {
    const whereCondition = filter.companyId
      ? eq(collaborations.companyId, filter.companyId)
      : filter.partnerId
      ? eq(collaborations.partnerId, filter.partnerId)
      : undefined;

    if (!whereCondition) return [];

    const baseCollabs = await db
      .select({
        collaborationId: collaborations.id,
        collaborationStatus: collaborations.status,
        finalBudget: collaborations.finalBudget,
        targetBeneficiaries: collaborations.targetBeneficiaries,
        createdAt: collaborations.createdAt,
        opportunityTitle: opportunities.title,
        proposalTitle: proposals.title,
        partnerId: partners.id,
        partnerName: partners.name,
        partnerLogo: partners.logoUrl,
        companyId: companies.id,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
      })
      .from(collaborations)
      .leftJoin(opportunities, eq(collaborations.opportunityId, opportunities.id))
      .leftJoin(proposals, eq(collaborations.proposalId, proposals.id))
      .leftJoin(companies, eq(collaborations.companyId, companies.id))
      .leftJoin(partners, eq(collaborations.partnerId, partners.id))
      .where(whereCondition)
      .orderBy(desc(collaborations.createdAt));

    const conversations: ConversationListItem[] = [];

    for (const c of baseCollabs) {
      // Find latest message
      const latestMsgRows = await db
        .select({
          content: collaborationMessages.content,
          createdAt: collaborationMessages.createdAt,
          senderName: users.name,
        })
        .from(collaborationMessages)
        .leftJoin(users, eq(collaborationMessages.senderId, users.id))
        .where(eq(collaborationMessages.collaborationId, c.collaborationId))
        .orderBy(desc(collaborationMessages.createdAt))
        .limit(1);

      // Count unread messages sent by the other party
      const [unreadRes] = await db
        .select({ count: count() })
        .from(collaborationMessages)
        .where(
          and(
            eq(collaborationMessages.collaborationId, c.collaborationId),
            ne(collaborationMessages.senderId, currentUserId),
            eq(collaborationMessages.isRead, false)
          )
        );

      const latestMsg = latestMsgRows[0] || null;

      conversations.push({
        collaborationId: c.collaborationId,
        collaborationStatus: c.collaborationStatus,
        finalBudget: c.finalBudget,
        targetBeneficiaries: c.targetBeneficiaries,
        opportunityTitle: c.opportunityTitle || "Inisiatif CSR",
        proposalTitle: c.proposalTitle || "Proposal Kerjasama",
        partnerId: c.partnerId || "",
        partnerName: c.partnerName || "Mitra",
        partnerLogo: c.partnerLogo || null,
        companyId: c.companyId || "",
        companyName: c.companyName || "Perusahaan Sponsor",
        companyLogo: c.companyLogo || null,
        lastMessage: latestMsg?.content || null,
        lastMessageAt: latestMsg?.createdAt || c.createdAt,
        lastSenderName: latestMsg?.senderName || null,
        unreadCount: unreadRes?.count ?? 0,
      });
    }

    // Sort by latest message date descending
    conversations.sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return timeB - timeA;
    });

    return conversations;
  }

  async getMessages(collaborationId: string): Promise<MessageWithSender[]> {
    const rows = await db
      .select({
        id: collaborationMessages.id,
        collaborationId: collaborationMessages.collaborationId,
        senderId: collaborationMessages.senderId,
        senderName: users.name,
        senderRole: users.role,
        content: collaborationMessages.content,
        attachmentUrl: collaborationMessages.attachmentUrl,
        attachmentName: collaborationMessages.attachmentName,
        isRead: collaborationMessages.isRead,
        createdAt: collaborationMessages.createdAt,
      })
      .from(collaborationMessages)
      .leftJoin(users, eq(collaborationMessages.senderId, users.id))
      .where(eq(collaborationMessages.collaborationId, collaborationId))
      .orderBy(asc(collaborationMessages.createdAt));

    return rows.map((r) => ({
      id: r.id,
      collaborationId: r.collaborationId,
      senderId: r.senderId,
      senderName: r.senderName || "Pengguna",
      senderRole: r.senderRole || "CSR_ADMIN",
      content: r.content,
      attachmentUrl: r.attachmentUrl || null,
      attachmentName: r.attachmentName || null,
      isRead: r.isRead,
      createdAt: r.createdAt,
    }));
  }

  async createMessage(data: NewCollaborationMessage): Promise<MessageWithSender> {
    const id = data.id || crypto.randomUUID();
    await db.insert(collaborationMessages).values({
      ...data,
      id,
    });

    const [created] = await db
      .select({
        id: collaborationMessages.id,
        collaborationId: collaborationMessages.collaborationId,
        senderId: collaborationMessages.senderId,
        senderName: users.name,
        senderRole: users.role,
        content: collaborationMessages.content,
        attachmentUrl: collaborationMessages.attachmentUrl,
        attachmentName: collaborationMessages.attachmentName,
        isRead: collaborationMessages.isRead,
        createdAt: collaborationMessages.createdAt,
      })
      .from(collaborationMessages)
      .leftJoin(users, eq(collaborationMessages.senderId, users.id))
      .where(eq(collaborationMessages.id, id))
      .limit(1);

    if (!created) {
      throw new Error("Gagal mengirim pesan percakapan");
    }

    return {
      id: created.id,
      collaborationId: created.collaborationId,
      senderId: created.senderId,
      senderName: created.senderName || "Pengguna",
      senderRole: created.senderRole || "CSR_ADMIN",
      content: created.content,
      attachmentUrl: created.attachmentUrl || null,
      attachmentName: created.attachmentName || null,
      isRead: created.isRead,
      createdAt: created.createdAt,
    };
  }

  async markAsRead(collaborationId: string, currentUserId: string): Promise<void> {
    await db
      .update(collaborationMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(collaborationMessages.collaborationId, collaborationId),
          ne(collaborationMessages.senderId, currentUserId),
          eq(collaborationMessages.isRead, false)
        )
      );
  }
}
