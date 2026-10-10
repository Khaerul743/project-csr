import { authRepository } from "@/modules/auth";
import { PartnerRepository } from "./partner.repository";
import { PartnerService } from "./partner.service";
import { PartnerController } from "./partner.controller";

export const partnerRepository = new PartnerRepository();
export const partnerService = new PartnerService(partnerRepository, authRepository);
export const partnerController = new PartnerController(partnerService);

export * from "./partner.interface";
export * from "./partner.validation";
export * from "./partner.repository";
export * from "./partner.service";
export * from "./partner.controller";
