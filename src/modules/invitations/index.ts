import { authRepository } from "@/modules/auth";
import { InvitationRepository } from "./invitation.repository";
import { InvitationService } from "./invitation.service";
import { InvitationController } from "./invitation.controller";

export const invitationRepository = new InvitationRepository();
export const invitationService = new InvitationService(invitationRepository, authRepository);
export const invitationController = new InvitationController(invitationService);

export * from "./invitation.interface";
export * from "./invitation.validation";
export * from "./invitation.repository";
export * from "./invitation.service";
export * from "./invitation.controller";
