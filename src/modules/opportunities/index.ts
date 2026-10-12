import { OpportunityRepository } from "./opportunity.repository";
import { OpportunityService } from "./opportunity.service";
import { OpportunityController } from "./opportunity.controller";

export const opportunityRepository = new OpportunityRepository();
export const opportunityService = new OpportunityService(opportunityRepository);
export const opportunityController = new OpportunityController(opportunityService);

export * from "./opportunity.interface";
export * from "./opportunity.validation";
export * from "./opportunity.repository";
export * from "./opportunity.service";
export * from "./opportunity.controller";
