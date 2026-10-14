import { CollaborationStatus } from "@/db/schema/collaborations";
import { UserRole } from "@/db/schema/users";

export interface ConversationListItem {
  collaborationId: string;
  collaborationStatus: CollaborationStatus;
  finalBudget: string | null;
  targetBeneficiaries: string | null;
  opportunityTitle: string;
  proposalTitle: string;
  partnerId: string;
  partnerName: string;
  partnerLogo: string | null;
  companyId: string;
  companyName: string;
  companyLogo: string | null;
  lastMessage: string | null;
  lastMessageAt: string | Date | null;
  lastSenderName: string | null;
  unreadCount: number;
}

export interface MessageWithSender {
  id: string;
  collaborationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  isRead: boolean;
  createdAt: string | Date;
}

export const COLLABORATION_STATUS_CONFIG: Record<
  CollaborationStatus,
  { label: string; variant: "amber" | "emerald" | "rose" | "slate" }
> = {
  NEGOTIATION: { label: "Tahap Negosiasi", variant: "amber" },
  AGREED: { label: "Disepakati (MoU)", variant: "emerald" },
  CANCELLED: { label: "Dibatalkan", variant: "rose" },
};
