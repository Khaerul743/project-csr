import { CollaborationRepository } from "./collaboration.repository";
import { CollaborationService } from "./collaboration.service";
import { CollaborationController } from "./collaboration.controller";

export const collaborationRepository = new CollaborationRepository();
export const collaborationService = new CollaborationService(collaborationRepository);
export const collaborationController = new CollaborationController(collaborationService);

export * from "./collaboration.interface";
export * from "./collaboration.validation";
export * from "./collaboration.repository";
export * from "./collaboration.service";
export * from "./collaboration.controller";
