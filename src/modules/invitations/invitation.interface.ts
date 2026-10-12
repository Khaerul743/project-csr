import { Invitation, InvitationRole, InvitationStatus } from "@/db/schema/invitations";
import { SafeUser } from "@/modules/auth/auth.interface";

export interface CreateInvitationDTO {
  email: string;
  role?: "CSR_ADMIN" | "MANAGEMENT";
}

export interface AcceptInvitationDTO {
  invitationId?: string;
  token?: string;
}

export interface RejectInvitationDTO {
  invitationId: string;
}

export interface InvitationWithDetails extends Invitation {
  companyName?: string | null;
  companyLogo?: string | null;
  partnerName?: string | null;
  invitedByName?: string | null;
}

export interface AcceptInvitationResponseData {
  user: SafeUser;
  accessToken: string;
  organization: {
    id: string;
    name: string;
    type: "COMPANY" | "PARTNER";
  };
}
